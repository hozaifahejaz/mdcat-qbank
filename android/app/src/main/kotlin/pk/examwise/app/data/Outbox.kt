package pk.examwise.app.data

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withTimeoutOrNull
import kotlinx.serialization.json.JsonObject
import pk.examwise.app.data.db.AppDatabase
import pk.examwise.app.data.db.OutboxEntry
import pk.examwise.core.api.ApiError
import pk.examwise.core.api.ExamwiseApi

/* Requests that must reach the server but needn't hold up the student: answers in timed tests and mocks, and
   bookmarks and reports made without a connection. Sent in order; a failed send waits longer each time. */
class Outbox(private val db: suspend () -> AppDatabase, private val api: ExamwiseApi, private val scope: CoroutineScope) {
    private val lock = Mutex()
    private var job: Job? = null

    @OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
    val pending: Flow<Int> = flow { emit(db()) }.flatMapLatest { it.outbox().count() }

    suspend fun add(kind: String, path: String, body: JsonObject) {
        db().outbox().add(OutboxEntry(kind = kind, path = path, json = body.toString(), createdAt = System.currentTimeMillis()))
        kick()
    }

    /* Starts sending in the background if it isn't already. */
    fun kick() {
        if (job?.isActive == true) return
        job = scope.launch {
            var wait = 1_000L
            while (true) {
                when (sendAll()) {
                    Pass.Empty, Pass.Stopped -> return@launch
                    Pass.Offline -> { delay(wait); wait = (wait * 2).coerceAtMost(60_000L) }
                }
            }
        }
    }

    /* Tries to empty the outbox now; true when it is empty. Used before submitting a test. */
    suspend fun flush(timeoutMs: Long = 15_000): Boolean =
        withTimeoutOrNull(timeoutMs) { sendAll() == Pass.Empty } ?: false

    suspend fun size(): Int = db().outbox().size()
    suspend fun clear() { db().outbox().clear() }

    private enum class Pass { Empty, Offline, Stopped }

    private suspend fun sendAll(): Pass = lock.withLock {
        val dao = db().outbox()
        while (true) {
            val e = dao.first() ?: return Pass.Empty
            try {
                api.replay(e.path, ExamwiseApi.json.parseToJsonElement(e.json))
                dao.remove(e.id)
            } catch (err: ApiError) {
                when {
                    err.isOffline || err.status >= 500 || err.status == 429 -> { dao.tried(e.id); return Pass.Offline }
                    // Signed out, locked or too old: keep it for after the student is back.
                    err.status == 401 || err.status == 423 || err.status == 426 -> return Pass.Stopped
                    // 409 (the test was already submitted) and other refusals won't change by sending again.
                    else -> dao.remove(e.id)
                }
            }
        }
        @Suppress("UNREACHABLE_CODE") Pass.Empty
    }
}
