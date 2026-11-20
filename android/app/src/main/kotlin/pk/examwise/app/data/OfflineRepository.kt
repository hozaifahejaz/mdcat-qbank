package pk.examwise.app.data

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flow
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import pk.examwise.app.data.db.AppDatabase
import pk.examwise.app.data.db.OfflineAnswerEntity
import pk.examwise.app.data.db.OfflineSessionEntity
import pk.examwise.app.data.db.PackEntity
import pk.examwise.app.data.db.PackQuestionEntity
import pk.examwise.app.data.db.PackSummary
import pk.examwise.core.api.ApiError
import pk.examwise.core.api.ExamwiseApi
import pk.examwise.core.model.FullQuestion
import pk.examwise.core.model.SyncAnswer
import pk.examwise.core.model.SyncSession
import pk.examwise.core.offline.Lease
import java.util.UUID

/* Offline practice: packs of full questions kept only in the encrypted database, practiced without a connection
   and sent to the server afterwards (server/offline.ts). */
class OfflineRepository(
    private val db: suspend () -> AppDatabase,
    private val api: ExamwiseApi,
    private val prefs: Prefs,
    private val integrity: Integrity,
    private val outbox: Outbox,
    private val deviceKey: () -> String,
    private val now: () -> Long = System::currentTimeMillis,
) {
    @OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
    val packs: Flow<List<PackSummary>> = flow { emit(db()) }.flatMapLatest { it.offline().packs() }

    @OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
    val sessions: Flow<List<OfflineSessionEntity>> = flow { emit(db()) }.flatMapLatest { it.offline().finishedSessions() }

    private val json get() = ExamwiseApi.json

    suspend fun held(): Int = db().offline().held()

    /* Makes sure offline rows on this phone belong to [userId]; another account's are deleted. */
    suspend fun claimFor(userId: String) {
        val owner = prefs.offlineOwner()
        if (owner != null && owner != userId) wipeAll()
        prefs.setOfflineOwner(userId)
    }

    suspend fun download(bank: String, subjects: List<String>, chapters: List<String>, count: Int): Int {
        val r = api.pack(deviceKey(), integrity.token("pack"), bank, subjects, chapters, count)
        val p = r.pack
        val rows = p.items.mapIndexed { i, q -> PackQuestionEntity(p.id, q.id, i, json.encodeToString(FullQuestion.serializer(), q)) }
        db().offline().savePack(PackEntity(p.id, p.title, rows.size, p.expiresAt, now()), rows)
        prefs.setClock(Lease.renewed(r.now, now()))
        return rows.size
    }

    /* Extends every pack's lease, and drops the ones the server no longer knows. */
    suspend fun renew() {
        val r = api.renewPacks(deviceKey())
        val dao = db().offline()
        val live = r.packs.associate { it.id to it.expiresAt }
        for (p in dao.allPacks()) {
            val exp = live[p.id]
            if (exp == null) dao.deletePack(p.id) else dao.setExpiry(p.id, exp)
        }
        prefs.setClock(Lease.renewed(r.now, now()))
    }

    suspend fun delete(id: String) {
        db().offline().deletePack(id)
        val body = buildJsonObject { put("deviceKey", deviceKey()); put("id", id) }
        outbox.add("pack_release", "/api/study/pack/release", body)
    }

    /* True while the pack can be opened: before its lease ends by trusted time, and the clock wasn't set back. */
    suspend fun usable(expiresAt: Long): Boolean {
        val clock = prefs.clock()
        val t = now()
        prefs.setClock(Lease.seen(t, clock))
        return Lease.usable(expiresAt, t, clock)
    }

    suspend fun pack(id: String) = db().offline().pack(id)

    /* A new practice session over the pack's unanswered questions, in random order. */
    suspend fun startSession(packId: String): Pair<String, List<FullQuestion>>? {
        val dao = db().offline()
        val pack = dao.pack(packId) ?: return null
        val qs = dao.questions(packId).filter { !it.answered }.shuffled()
        if (qs.isEmpty()) return null
        val id = UUID.randomUUID().toString()
        val ids = qs.map { it.questionId }
        dao.upsertSession(OfflineSessionEntity(id, packId, pack.title, json.encodeToString(ListSerializer(String.serializer()), ids), now()))
        return id to qs.map { json.decodeFromString(FullQuestion.serializer(), it.json) }
    }

    suspend fun answer(sessionId: String, packId: String, idx: Int, questionId: String, answer: Int, seconds: Int?) {
        val dao = db().offline()
        dao.addAnswer(OfflineAnswerEntity(sessionId, idx, questionId, answer, seconds, now()))
        dao.markAnswered(packId, questionId)
    }

    /* Leaving the player ends the session. One with no answers is dropped. Returns true when it was kept. */
    suspend fun finishSession(sessionId: String): Boolean {
        val dao = db().offline()
        val s = dao.session(sessionId) ?: return false
        if (dao.answers(sessionId).isEmpty()) { dao.deleteSession(sessionId); return false }
        if (s.finishedAt == null) dao.upsertSession(s.copy(finishedAt = now()))
        return true
    }

    data class LocalItem(val q: FullQuestion, val chosen: Int?, val seconds: Int?)

    /* A finished session's questions and answers, for its review. */
    suspend fun localReview(sessionId: String): Pair<OfflineSessionEntity, List<LocalItem>>? {
        val dao = db().offline()
        val s = dao.session(sessionId) ?: return null
        val answers = dao.answers(sessionId)
        val qs = dao.questionsById(s.packId, answers.map { it.questionId }).associateBy { it.questionId }
        val items = answers.mapNotNull { a ->
            qs[a.questionId]?.let { LocalItem(json.decodeFromString(FullQuestion.serializer(), it.json), a.answer, a.seconds) }
        }
        return s to items
    }

    /* Sends finished sessions, 20 at a time. Returns how many were accepted. Throws ApiError when it can't. */
    suspend fun sync(): Int {
        val dao = db().offline()
        var sent = 0
        while (true) {
            val batch = dao.unsynced(20)
            if (batch.isEmpty()) break
            val sessions = batch.map { s ->
                SyncSession(
                    id = s.id, packId = s.packId, startedAt = s.startedAt, finishedAt = s.finishedAt ?: now(),
                    answers = dao.answers(s.id).map { SyncAnswer(it.questionId, it.answer, it.seconds, it.at) },
                )
            }
            val accepted = api.sync(deviceKey(), sessions)
            if (accepted.isEmpty()) break
            dao.markSynced(accepted)
            sent += accepted.size
            if (accepted.size < batch.size) break
        }
        dao.dropOldSessions(now() - 30L * 24 * 60 * 60 * 1000)
        return sent
    }

    suspend fun unsyncedCount(): Int = db().offline().unsyncedCount()

    /* Packs go on sign-out, a free plan, or a refused device. Unsent answers stay for the same account. */
    suspend fun wipePacks() { db().offline().wipePacks() }

    suspend fun wipeAll() {
        db().offline().wipePacks()
        db().offline().wipeSessions()
    }

    companion object {
        fun isOfflineError(e: Throwable) = e is ApiError && e.isOffline
    }
}
