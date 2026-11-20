package com.markhorprep.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/* The JSON shapes the server sends (server/routes.ts, server/study.ts, server/app.ts, server/offline.ts).
   Unknown fields are ignored, so the server can add fields without breaking older app versions. */

// ---------- Account ----------

@Serializable
data class User(
    val id: String,
    val name: String,
    val email: String? = null,
    val phone: String? = null,
    val plan: String = "free",
    val role: String = "student",
    val planExpiresAt: String? = null,
    val methods: List<String> = emptyList(),
) {
    val isFree: Boolean get() = plan == "free" && role == "student"
    val isStudent: Boolean get() = role == "student"
}

@Serializable
data class MeResponse(val user: User? = null)

@Serializable
data class AuthConfig(
    val email: Boolean = true,
    val emailVerification: Boolean = false,
    val passwordReset: Boolean = false,
    val phone: Boolean = false,
    val google: Boolean = false,
    val apple: Boolean = false,
)

/* Answer to sign-in, sign-up, phone and Google sign-in. The app gets its session secret in the body. */
@Serializable
data class SignInResult(
    val ok: Boolean = false,
    val status: String? = null,
    val created: Boolean? = null,
    val token: String? = null,
    val expiresAt: Long? = null,
)

@Serializable
data class StatusResult(val status: String? = null, val phone: String? = null, val ok: Boolean? = null)

// ---------- App config and banks ----------

@Serializable
data class PaperShare(val subject: String, val count: Int)

@Serializable
data class OfflineConfig(val enabled: Boolean = false, val maxQuestions: Int = 300, val leaseDays: Int = 7)

@Serializable
data class IntegrityConfig(val cloudProjectNumber: Long? = null)

@Serializable
data class GoogleConfig(val webClientId: String? = null)

@Serializable
data class Support(val email: String? = null, val whatsapp: String? = null, val site: String? = null)

@Serializable
data class AppConfig(
    val minVersion: Int = 1,
    val latestVersion: Int = 1,
    val checkinSeconds: Int = 60,
    val examDate: String? = null,
    val paper: List<PaperShare> = emptyList(),
    val offline: OfflineConfig = OfflineConfig(),
    val integrity: IntegrityConfig = IntegrityConfig(),
    val google: GoogleConfig = GoogleConfig(),
    val support: Support = Support(),
)

@Serializable
data class BankSubject(val name: String, val chapters: List<String> = emptyList())

@Serializable
data class Bank(val id: String, val name: String, val short: String = name, val blurb: String = "", val subjects: List<BankSubject> = emptyList())


// ---------- Devices ----------

@Serializable
data class Device(
    val id: String,
    val label: String,
    @SerialName("created_at") val createdAt: Long = 0,
    @SerialName("last_seen_at") val lastSeenAt: Long = 0,
    val active: Boolean = false,
    val platform: String? = null,
)

@Serializable
data class ClaimResponse(
    val status: String,
    @SerialName("takeovers_today") val takeoversToday: Int? = null,
    val devices: List<Device> = emptyList(),
    @SerialName("next_allowed_at") val nextAllowedAt: String? = null,
    val token: String? = null,
)

sealed interface ClaimResult {
    data object Active : ClaimResult
    data class DeviceLimit(val devices: List<Device>) : ClaimResult
    data class TakeoverLimit(val nextAllowedAt: String?) : ClaimResult
}

@Serializable
data class CheckResponse(val status: String, @SerialName("active_label") val activeLabel: String? = null)

sealed interface CheckResult {
    data object Active : CheckResult
    data object Idle : CheckResult
    data class Locked(val activeLabel: String?) : CheckResult
}

@Serializable
data class RemoveResponse(
    val status: String,
    val devices: List<Device> = emptyList(),
    @SerialName("next_allowed_at") val nextAllowedAt: String? = null,
)

sealed interface RemoveResult {
    data class Removed(val devices: List<Device>) : RemoveResult
    data class SwapLimit(val nextAllowedAt: String?) : RemoveResult
    data object NotFound : RemoveResult
}

// ---------- Study ----------

@Serializable
data class ChapterCount(
    val subject: String,
    val chapter: String,
    val total: Int = 0,
    val open: Int = 0,
    val answered: Int = 0,
    val correct: Int = 0,
)

@Serializable
data class PastPaper(val year: Int, val count: Int)

@Serializable
data class Catalog(
    val paid: Boolean = false,
    val bank: String = "mdcat",
    val chapters: List<ChapterCount> = emptyList(),
    val papers: List<PastPaper> = emptyList(),
    val mocks: Int = 0,
    val mockReady: Boolean = false,
    val miniReady: Boolean = false,
    val miniUsed: Boolean = false,
    val miniOpen: String? = null,
)

/* Where a question stands for the student. A practice set can draw from any mix of them. */
enum class Filter(val wire: String, val label: String) {
    Unused("unused", "Unused"),
    Incorrect("incorrect", "Incorrect"),
    Marked("marked", "Marked"),
    Omitted("omitted", "Omitted"),
    Correct("correct", "Correct"),
}

@Serializable
data class Pool(
    val total: Int = 0,
    val unused: Int = 0,
    val incorrect: Int = 0,
    val marked: Int = 0,
    val omitted: Int = 0,
    val correct: Int = 0,
    val markedIn: Map<String, Int> = emptyMap(),
) {
    fun count(f: Filter): Int = when (f) {
        Filter.Unused -> unused
        Filter.Incorrect -> incorrect
        Filter.Marked -> marked
        Filter.Omitted -> omitted
        Filter.Correct -> correct
    }

    /* How many questions a mix of filters matches; none picked means every question (lib/study.ts poolMatch). */
    fun match(picked: Set<Filter>): Int {
        if (picked.isEmpty()) return total
        val states = listOf(Filter.Unused, Filter.Incorrect, Filter.Omitted, Filter.Correct)
        return states.sumOf { s ->
            when {
                s in picked -> count(s)
                Filter.Marked in picked -> markedIn[s.wire] ?: 0
                else -> 0
            }
        }
    }
}

/* A question as asked: no key. */
@Serializable
data class Question(
    val id: String,
    val subject: String,
    val chapter: String = "",
    val topic: String = "",
    val stem: String,
    val options: List<String>,
)

/* A question with its key and explanation. wrong maps an option index ("0" to "3") to why it is wrong. */
@Serializable
data class FullQuestion(
    val id: String,
    val subject: String,
    val chapter: String = "",
    val topic: String = "",
    val difficulty: String = "",
    val source: String = "",
    val stem: String,
    val options: List<String>,
    val answer: Int,
    val why: String = "",
    val wrong: Map<String, String> = emptyMap(),
) {
    fun asked() = Question(id, subject, chapter, topic, stem, options)
    fun wrongFor(i: Int): String? = wrong[i.toString()]
}

@Serializable
data class Stats(val n: Int = 0, val picks: List<Int> = emptyList())

@Serializable
data class SittingItem(
    val idx: Int,
    val q: Question,
    val answer: Int? = null,
    val flagged: Boolean = false,
    val checked: Boolean = false,
    val bookmarked: Boolean = false,
    val seconds: Int? = null,
    val reveal: FullQuestion? = null,
    val stats: Stats? = null,
)

@Serializable
data class Sitting(
    val id: String,
    val kind: String,
    val mode: String,
    val title: String,
    val startedAt: Long,
    val deadlineAt: Long? = null,
    val now: Long,
    val items: List<SittingItem>,
)

sealed interface AttemptResult {
    data class Open(val sitting: Sitting) : AttemptResult
    data class Finished(val id: String) : AttemptResult
}

@Serializable
data class StartResult(val id: String, val count: Int, val short: Boolean = false, val attempt: Sitting)

@Serializable
data class CheckAnswerResult(val answer: Int, val reveal: FullQuestion, val stats: Stats? = null)

@Serializable
data class FinishResult(val id: String, val empty: Boolean = false, val review: Review? = null)

/* The key and explanation of the practice question on screen, read while the student thinks (GET /api/study/peek). */
@Serializable
data class Peek(val reveal: FullQuestion, val stats: Stats? = null)

@Serializable
data class QuietCheck(val answer: Int)

@Serializable
data class TestResult(
    val id: String,
    val kind: String,
    val title: String,
    val date: String,
    val score: Int = 0,
    val total: Int = 0,
    val minutes: Int = 0,
    val mode: String? = null,
    val seconds: Int? = null,
)

@Serializable
data class ReviewItem(
    val q: FullQuestion,
    val chosen: Int? = null,
    val flagged: Boolean = false,
    val bookmarked: Boolean = false,
    val seconds: Int? = null,
    val stats: Stats? = null,
)

@Serializable
data class Review(val attempt: TestResult, val withdrawn: Int = 0, val items: List<ReviewItem> = emptyList())

@Serializable
data class HistoryResponse(val tests: List<TestResult> = emptyList())

@Serializable
data class ChapterStat(val chapter: String, val answered: Int = 0, val available: Int = 0, val correct: Int = 0)

@Serializable
data class SubjectStat(val subject: String, val chapters: List<ChapterStat> = emptyList()) {
    val answered: Int get() = chapters.sumOf { it.answered }
    val correct: Int get() = chapters.sumOf { it.correct }
}

@Serializable
data class WeakTopic(val subject: String, val chapter: String, val topic: String, val answered: Int = 0, val correct: Int = 0)

@Serializable
data class DayActivity(val date: String, val answered: Int = 0, val correct: Int = 0)

@Serializable
data class Resume(val title: String, val done: Int = 0, val total: Int = 0, val href: String = "") {
    /* The open test's id, from the website link "/test?id=…". */
    val attemptId: String? get() = href.substringAfter("id=", "").substringBefore('&').ifEmpty { null }
}

@Serializable
data class Dashboard(
    val bank: String? = null,
    val welcomed: Boolean? = null,
    val examYear: Int? = null,
    val answeredEver: Int? = null,
    val secondsPerQuestion: Double? = null,
    val streakDays: Int = 0,
    val dailyGoal: Int = 0,
    val daily: List<DayActivity> = emptyList(),
    val bookmarks: Int = 0,
    val mistakesToRetry: Int = 0,
    val nextMock: String? = null,
    val resume: Resume? = null,
    val subjects: List<SubjectStat> = emptyList(),
    val weakTopics: List<WeakTopic> = emptyList(),
    val recent: List<TestResult> = emptyList(),
)

@Serializable
data class Mistake(val q: FullQuestion, val chosen: Int, val date: String, val tries: Int = 1)

@Serializable
data class MistakesResponse(val mistakes: List<Mistake> = emptyList())

@Serializable
data class BookmarksResponse(val bookmarks: List<FullQuestion> = emptyList())

@Serializable
data class BookmarkResult(val ok: Boolean = true, val on: Boolean = false)

/* What a new test asks for (POST /api/study/start). */
@Serializable
data class StartRequest(
    val kind: String,
    val bank: String? = null,
    val subject: String? = null,
    val subjects: List<String>? = null,
    val chapters: List<String>? = null,
    val topic: String? = null,
    val filters: List<String>? = null,
    val tutor: Boolean? = null,
    val timed: Boolean? = null,
    val count: Int? = null,
    val mock: Int? = null,
    val paper: Int? = null,
    val ids: List<String>? = null,
    val title: String? = null,
)

// ---------- Offline ----------

@Serializable
data class PackPayload(val id: String, val title: String, val expiresAt: Long, val items: List<FullQuestion> = emptyList())

@Serializable
data class PackResponse(val pack: PackPayload, val held: Int = 0, val cap: Int = 300, val now: Long)

@Serializable
data class PackLease(val id: String, val expiresAt: Long)

@Serializable
data class RenewResponse(val packs: List<PackLease> = emptyList(), val held: Int = 0, val cap: Int = 300, val now: Long)

@Serializable
data class SyncAnswer(val questionId: String, val answer: Int, val seconds: Int? = null, val at: Long)

@Serializable
data class SyncSession(val id: String, val packId: String, val startedAt: Long, val finishedAt: Long, val answers: List<SyncAnswer>)

@Serializable
data class SyncResponse(val accepted: List<String> = emptyList())

@Serializable
data class OkResponse(val ok: Boolean = true)
