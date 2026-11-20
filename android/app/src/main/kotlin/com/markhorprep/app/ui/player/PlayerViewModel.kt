package com.markhorprep.app.ui.player

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import com.markhorprep.app.AppContainer
import com.markhorprep.app.work.SyncWorker
import com.markhorprep.core.api.ApiError
import com.markhorprep.core.api.MarkhorPrepApi
import com.markhorprep.core.model.AttemptResult
import com.markhorprep.core.model.CheckAnswerResult
import com.markhorprep.core.model.Peek
import com.markhorprep.core.model.FullQuestion
import com.markhorprep.core.model.Question
import com.markhorprep.core.model.Stats

/* One question as the player shows it. [picked] is a tutor-mode choice not yet submitted. */
data class PItem(
    val idx: Int,
    val q: Question,
    val answer: Int? = null,
    val picked: Int? = null,
    val flagged: Boolean = false,
    val checked: Boolean = false,
    val bookmarked: Boolean = false,
    val seconds: Int = 0,
    val reveal: FullQuestion? = null,
    val stats: Stats? = null,
)

data class PlayerState(
    val loading: Boolean = true,
    val error: String? = null,
    val title: String = "",
    val mode: String = "tutor",
    val items: List<PItem> = emptyList(),
    val index: Int = 0,
    val deadlineAt: Long? = null,
    /* server time minus phone time */
    val offset: Long = 0,
    val crossed: Map<Int, Set<Int>> = emptyMap(),
    val busy: Boolean = false,
    val message: String? = null,
    val shortNote: String? = null,
    val offline: Boolean = false,
    /* Where to go when the sitting is over: a review route, or back. */
    val done: Done? = null,
) {
    val current: PItem? get() = items.getOrNull(index)
    val tutor: Boolean get() = mode == "tutor"
    val answeredCount: Int get() = items.count { it.answer != null }
}

sealed interface Done {
    data class Review(val id: String) : Done
    data class LocalReview(val sessionId: String) : Done
    data object Back : Done
}

/* Where a sitting's questions come from and where its answers go: the server, or a pack on the phone. */
interface PlayerSource {
    val offline: Boolean
    suspend fun load(): Loaded
    suspend fun check(item: PItem, answer: Int, seconds: Int): CheckAnswerResult
    /* Practice: the key and explanation fetched ahead, then the answer locked in without them. Null where the source
       can't (offline packs check on the phone anyway). */
    suspend fun peek(item: PItem): Peek? = null
    suspend fun checkQuiet(item: PItem, answer: Int, seconds: Int): Int = check(item, answer, seconds).answer
    suspend fun save(item: PItem)
    suspend fun bookmark(questionId: String, on: Boolean)
    suspend fun report(questionId: String, reason: String, details: String)
    suspend fun finish(): Done

    data class Loaded(val title: String, val mode: String, val items: List<PItem>, val deadlineAt: Long?, val serverNow: Long?, val shortNote: String? = null, val finished: Done? = null)
}

class OnlineSource(private val c: AppContainer, private val id: String) : PlayerSource {
    override val offline = false

    override suspend fun load(): PlayerSource.Loaded {
        val sitting = c.study.takeStarted(id) ?: when (val r = c.study.attempt(id)) {
            is AttemptResult.Finished -> return PlayerSource.Loaded("", "tutor", emptyList(), null, null, finished = Done.Review(r.id))
            is AttemptResult.Open -> r.sitting
        }
        val items = sitting.items.map {
            PItem(it.idx, it.q, it.answer, null, it.flagged, it.checked, it.bookmarked, it.seconds ?: 0, it.reveal, it.stats)
        }
        return PlayerSource.Loaded(sitting.title, sitting.mode, items, sitting.deadlineAt, sitting.now, c.study.takeShortNote(id))
    }

    override suspend fun check(item: PItem, answer: Int, seconds: Int) = c.study.check(id, item.idx, answer, seconds)
    override suspend fun peek(item: PItem): Peek = c.study.peek(id, item.idx)
    override suspend fun checkQuiet(item: PItem, answer: Int, seconds: Int) = c.study.checkQuiet(id, item.idx, answer, seconds)

    override suspend fun save(item: PItem) {
        c.outbox.add("answer", "/api/study/answer", MarkhorPrepApi.answerBody(id, item.idx, item.answer, item.flagged, item.seconds))
    }

    override suspend fun bookmark(questionId: String, on: Boolean) {
        c.outbox.add("bookmark", "/api/study/bookmark", buildJsonObject { put("questionId", questionId); put("on", on) })
    }

    override suspend fun report(questionId: String, reason: String, details: String) {
        c.outbox.add("report", "/api/study/report", buildJsonObject { put("questionId", questionId); put("reason", reason); put("details", details) })
    }

    override suspend fun finish(): Done {
        if (!c.outbox.flush()) throw ApiError(0, "offline", "Some answers haven't reached us yet. Connect to the internet, then submit again.")
        return try {
            Done.Review(c.study.finish(id).id)
        } catch (e: ApiError) {
            // Already submitted, or the clock ran out on the server: its review is ready.
            if (e.code == "time_up" || e.code == "finished") Done.Review(id) else throw e
        }
    }
}

/* Tutor practice from a downloaded pack: the key and explanation are on the phone, no statistics. */
class OfflineSource(private val c: AppContainer, private val packId: String) : PlayerSource {
    override val offline = true
    private var sessionId: String? = null
    private val full = mutableMapOf<String, FullQuestion>()

    override suspend fun load(): PlayerSource.Loaded {
        val pack = c.offline.pack(packId) ?: throw ApiError(404, "gone", "This download isn't on your phone any more.")
        if (!c.offline.usable(pack.expiresAt)) throw ApiError(0, "expired", "Connect to the internet to continue.")
        val (sid, qs) = c.offline.startSession(packId) ?: throw ApiError(409, "empty", "You've answered every question in this download. Delete it to make room for new ones.")
        sessionId = sid
        qs.forEach { full[it.id] = it }
        return PlayerSource.Loaded(pack.title, "tutor", qs.mapIndexed { i, q -> PItem(i, q.asked()) }, null, null)
    }

    override suspend fun check(item: PItem, answer: Int, seconds: Int): CheckAnswerResult {
        val q = full.getValue(item.q.id)
        c.offline.answer(sessionId!!, packId, item.idx, q.id, answer, seconds)
        return CheckAnswerResult(answer, q, null)
    }

    override suspend fun save(item: PItem) = Unit
    override suspend fun bookmark(questionId: String, on: Boolean) {
        c.outbox.add("bookmark", "/api/study/bookmark", buildJsonObject { put("questionId", questionId); put("on", on) })
    }
    override suspend fun report(questionId: String, reason: String, details: String) {
        c.outbox.add("report", "/api/study/report", buildJsonObject { put("questionId", questionId); put("reason", reason); put("details", details) })
    }

    override suspend fun finish(): Done {
        val sid = sessionId ?: return Done.Back
        val kept = c.offline.finishSession(sid)
        if (kept) SyncWorker.queue(c.app)
        return if (kept) Done.LocalReview(sid) else Done.Back
    }

    /* Leaving without submitting still ends the session (answers so far are kept and sent). */
    suspend fun leave() { sessionId?.let { if (c.offline.finishSession(it)) SyncWorker.queue(c.app) } }
}

class PlayerViewModel(private val source: PlayerSource, private val now: () -> Long = System::currentTimeMillis) : ViewModel() {
    private val _state = MutableStateFlow(PlayerState(offline = source.offline))
    val state: StateFlow<PlayerState> = _state.asStateFlow()
    private var shownAt = now()
    private var clock: Job? = null
    /* Practice questions' keys and explanations, read while the student reads the question (the website does the same),
       so Submit shows the result at once. Kept by question number; only ever shown once the answer is locked in. */
    private val peeks = mutableMapOf<Int, Peek>()
    private val peeking = mutableSetOf<Int>()

    init { load() }

    fun load() {
        _state.update { it.copy(loading = true, error = null) }
        viewModelScope.launch {
            try {
                val l = source.load()
                if (l.finished != null) { _state.update { it.copy(done = l.finished) }; return@launch }
                val first = l.items.indexOfFirst { if (l.mode == "tutor") !it.checked else it.answer == null }.coerceAtLeast(0)
                _state.update {
                    it.copy(
                        loading = false, title = l.title, mode = l.mode, items = l.items, index = first, deadlineAt = l.deadlineAt,
                        offset = l.serverNow?.let { s -> s - now() } ?: 0, shortNote = l.shortNote,
                    )
                }
                shownAt = now()
                startClock()
                prefetch()
            } catch (e: ApiError) {
                _state.update { it.copy(loading = false, error = e.message) }
            }
        }
    }

    /* Seconds left on the clock, by the server's time; null when there is no clock. */
    fun secondsLeft(): Long? = _state.value.deadlineAt?.let { ((it - (now() + _state.value.offset)) / 1000).coerceAtLeast(0) }

    private fun startClock() {
        if (_state.value.deadlineAt == null) return
        clock?.cancel()
        clock = viewModelScope.launch {
            while (isActive) {
                if ((secondsLeft() ?: 1) <= 0L) { submit(force = true); return@launch }
                delay(1000)
            }
        }
    }

    /* Adds the time spent on the current question to it, while it is still open. */
    private fun tally() {
        val t = now()
        val spent = ((t - shownAt) / 1000).toInt()
        shownAt = t
        if (spent <= 0) return
        _state.update { s ->
            val cur = s.current ?: return@update s
            if (s.tutor && cur.checked) s else s.copy(items = s.items.map { if (it.idx == cur.idx) it.copy(seconds = (it.seconds + spent).coerceAtMost(3600)) else it })
        }
    }

    private fun updateItem(idx: Int, f: (PItem) -> PItem) = _state.update { s -> s.copy(items = s.items.map { if (it.idx == idx) f(it) else it }) }

    fun go(i: Int) {
        if (i !in _state.value.items.indices) return
        tally()
        _state.update { it.copy(index = i, message = null) }
        prefetch()
    }

    /* Reads ahead the key for the practice question on screen and the next one. Failures are quiet: Submit then asks. */
    private fun prefetch() {
        val s = _state.value
        if (!s.tutor || source.offline) return
        listOf(s.index, s.index + 1).mapNotNull { s.items.getOrNull(it) }.filter { !it.checked && it.idx !in peeks && it.idx !in peeking }.forEach { item ->
            peeking += item.idx
            viewModelScope.launch {
                try { source.peek(item)?.let { peeks[item.idx] = it } } catch (_: ApiError) {} finally { peeking -= item.idx }
            }
        }
    }

    fun next() = go(_state.value.index + 1)
    fun prev() = go(_state.value.index - 1)

    fun choose(option: Int) {
        val s = _state.value
        val cur = s.current ?: return
        if (s.tutor) {
            if (!cur.checked) updateItem(cur.idx) { it.copy(picked = option) }
        } else {
            tally()
            val updated = cur.copy(answer = option, seconds = _state.value.current?.seconds ?: cur.seconds)
            updateItem(cur.idx) { updated }
            viewModelScope.launch { runCatching { source.save(updated) } }
        }
    }

    fun cross(option: Int) {
        val cur = _state.value.current ?: return
        _state.update { s ->
            val set = s.crossed[cur.idx].orEmpty()
            s.copy(crossed = s.crossed + (cur.idx to if (option in set) set - option else set + option))
        }
    }

    /* Tutor mode: lock the answer and show the explanation. */
    fun check() {
        val cur = _state.value.current ?: return
        val pick = cur.picked ?: return
        if (cur.checked || _state.value.busy) return
        tally()
        val seconds = _state.value.current?.seconds ?: cur.seconds
        val ahead = peeks[cur.idx]
        if (ahead != null) {
            // Show the result now and lock the answer in behind it. If that fails, the answer goes back to unlocked.
            updateItem(cur.idx) { it.copy(answer = pick, checked = true, reveal = ahead.reveal, stats = ahead.stats, picked = null) }
            viewModelScope.launch {
                try {
                    val saved = source.checkQuiet(cur, pick, seconds)
                    if (saved != pick) updateItem(cur.idx) { it.copy(answer = saved) }
                } catch (e: ApiError) {
                    if (e.code == "time_up" || e.code == "finished") { finishNow(); return@launch }
                    if (e.code != "locked") {
                        updateItem(cur.idx) { it.copy(answer = null, checked = false, reveal = null, stats = null, picked = pick) }
                        _state.update { it.copy(message = e.message) }
                    }
                }
            }
            return
        }
        _state.update { it.copy(busy = true, message = null) }
        viewModelScope.launch {
            try {
                val r = source.check(cur, pick, seconds)
                updateItem(cur.idx) { it.copy(answer = r.answer, checked = true, reveal = r.reveal, stats = r.stats, picked = null) }
            } catch (e: ApiError) {
                if (e.code == "time_up" || e.code == "finished") { finishNow(); return@launch }
                _state.update { it.copy(message = e.message) }
            } finally { _state.update { it.copy(busy = false) } }
        }
    }

    fun flag() {
        val cur = _state.value.current ?: return
        val updated = cur.copy(flagged = !cur.flagged)
        updateItem(cur.idx) { updated }
        if (!_state.value.tutor) viewModelScope.launch { runCatching { source.save(updated) } }
    }

    fun bookmark() {
        val cur = _state.value.current ?: return
        val on = !cur.bookmarked
        updateItem(cur.idx) { it.copy(bookmarked = on) }
        viewModelScope.launch { runCatching { source.bookmark(cur.q.id, on) } }
    }

    fun report(reason: String, details: String) {
        val cur = _state.value.current ?: return
        viewModelScope.launch {
            runCatching { source.report(cur.q.id, reason, details) }
            _state.update { it.copy(message = "Thanks. Our reviewers will look at it.") }
        }
    }

    /* Submit the test (timed and mock), or end the practice set. */
    fun submit(force: Boolean = false) {
        if (_state.value.busy && !force) return
        tally()
        _state.update { it.copy(busy = true, message = null) }
        viewModelScope.launch { finishNow() }
    }

    private suspend fun finishNow() {
        try {
            val d = source.finish()
            clock?.cancel()
            _state.update { it.copy(done = d, busy = false) }
        } catch (e: ApiError) {
            _state.update { it.copy(busy = false, message = e.message) }
        }
    }

    /* Leaving keeps an online test open to resume; an offline session ends. */
    fun leave(after: () -> Unit) {
        viewModelScope.launch {
            (source as? OfflineSource)?.leave()
            after()
        }
    }
}
