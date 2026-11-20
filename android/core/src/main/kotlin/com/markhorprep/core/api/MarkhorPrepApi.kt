package com.markhorprep.core.api

import io.ktor.client.HttpClient
import io.ktor.client.engine.HttpClientEngine
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.request.HttpRequestBuilder
import io.ktor.client.request.header
import io.ktor.client.request.request
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpMethod
import io.ktor.http.content.TextContent
import io.ktor.http.encodeURLParameter
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.encodeToJsonElement
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import com.markhorprep.core.model.AppConfig
import com.markhorprep.core.model.AttemptResult
import com.markhorprep.core.model.AuthConfig
import com.markhorprep.core.model.Bank
import com.markhorprep.core.model.BookmarkResult
import com.markhorprep.core.model.BookmarksResponse
import com.markhorprep.core.model.Catalog
import com.markhorprep.core.model.CheckAnswerResult
import com.markhorprep.core.model.CheckResponse
import com.markhorprep.core.model.CheckResult
import com.markhorprep.core.model.ClaimResponse
import com.markhorprep.core.model.ClaimResult
import com.markhorprep.core.model.Dashboard
import com.markhorprep.core.model.Device
import com.markhorprep.core.model.FinishResult
import com.markhorprep.core.model.Peek
import com.markhorprep.core.model.QuietCheck
import com.markhorprep.core.model.FullQuestion
import com.markhorprep.core.model.HistoryResponse
import com.markhorprep.core.model.MeResponse
import com.markhorprep.core.model.Mistake
import com.markhorprep.core.model.MistakesResponse
import com.markhorprep.core.model.OkResponse
import com.markhorprep.core.model.PackResponse
import com.markhorprep.core.model.Pool
import com.markhorprep.core.model.RemoveResponse
import com.markhorprep.core.model.RemoveResult
import com.markhorprep.core.model.RenewResponse
import com.markhorprep.core.model.Review
import com.markhorprep.core.model.SignInResult
import com.markhorprep.core.model.Sitting
import com.markhorprep.core.model.StartRequest
import com.markhorprep.core.model.StartResult
import com.markhorprep.core.model.StatusResult
import com.markhorprep.core.model.SyncResponse
import com.markhorprep.core.model.SyncSession
import com.markhorprep.core.model.TestResult
import com.markhorprep.core.model.User

/* One suspend function per endpoint. Every call sends the session secret when there is one, plus the app's
   headers; every failure becomes an ApiError, and the ones the whole app must answer (signed out, locked, too old)
   are also sent on [events]. */
class MarkhorPrepApi(
    baseUrl: String,
    private val appVersion: Int,
    private val tokens: TokenStore,
    engine: HttpClientEngine? = null,
) {
    private val base = baseUrl.trimEnd('/')
    private val _events = MutableSharedFlow<SessionEvent>(extraBufferCapacity = 8)
    val events: SharedFlow<SessionEvent> = _events.asSharedFlow()

    private val client: HttpClient = (if (engine != null) HttpClient(engine) { config() } else HttpClient(OkHttp) { config() })

    private fun io.ktor.client.HttpClientConfig<*>.config() {
        expectSuccess = false
        install(HttpTimeout) {
            connectTimeoutMillis = 15_000
            requestTimeoutMillis = 30_000
        }
    }

    // ---------- Plumbing ----------

    private suspend fun call(method: HttpMethod, path: String, body: JsonElement? = null): JsonElement {
        val token = tokens.token()
        val response = try {
            client.request(base + path) {
                this.method = method
                headers(token)
                if (body != null) setBody(TextContent(body.toString(), ContentType.Application.Json))
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            throw ApiError.offline()
        }
        val text = try { response.bodyAsText() } catch (e: CancellationException) { throw e } catch (e: Exception) { throw ApiError.offline() }
        val parsed = runCatching { json.parseToJsonElement(text) }.getOrNull()
        val status = response.status.value
        if (status !in 200..299) throw toError(status, parsed)
        val element = parsed ?: JsonNull
        // A new session secret arrives in the body: sign-in, and a device takeover.
        (element as? JsonObject)?.get("token")?.jsonPrimitive?.contentOrNull?.let { tokens.save(it) }
        return element
    }

    private fun HttpRequestBuilder.headers(token: String?) {
        if (token != null) header("Authorization", "Bearer $token")
        header("X-Client", "android")
        header("X-App-Version", appVersion.toString())
        header("User-Agent", "MarkhorPrep-Android/$appVersion")
        header("Accept", "application/json")
    }

    private suspend fun toError(status: Int, parsed: JsonElement?): ApiError {
        val err = (parsed as? JsonObject)?.get("error") as? JsonObject
        val code = err?.get("code")?.jsonPrimitive?.contentOrNull ?: "http_$status"
        val message = err?.get("message")?.jsonPrimitive?.contentOrNull ?: defaultMessage(status)
        val extra = JsonObject(err.orEmpty().filterKeys { it != "code" && it != "message" })
        val error = ApiError(status, code, message, extra)
        when {
            status == 401 && code == "signed_out" -> { tokens.clear(); _events.tryEmit(SessionEvent.SignedOut) }
            status == 423 -> _events.tryEmit(SessionEvent.Locked)
            status == 426 -> _events.tryEmit(SessionEvent.UpdateRequired)
            status == 403 && code == "integrity_failed" -> _events.tryEmit(SessionEvent.IntegrityFailed(message))
        }
        return error
    }

    private fun defaultMessage(status: Int) = when (status) {
        in 500..599 -> "Something went wrong on our side. Please try again in a moment."
        else -> "Something went wrong. Please try again."
    }

    private suspend inline fun <reified T> get(path: String): T = json.decodeFromJsonElement(call(HttpMethod.Get, path))

    private suspend inline fun <reified T> post(path: String, body: JsonElement = JsonObject(emptyMap())): T =
        json.decodeFromJsonElement(call(HttpMethod.Post, path, body))

    private suspend inline fun <reified T> patch(path: String, body: JsonElement): T = json.decodeFromJsonElement(call(HttpMethod.Patch, path, body))

    private fun q(vararg pairs: Pair<String, String?>): String {
        val parts = pairs.filter { !it.second.isNullOrEmpty() }.map { "${it.first}=${it.second!!.encodeURLParameter()}" }
        return if (parts.isEmpty()) "" else "?" + parts.joinToString("&")
    }

    // ---------- App ----------

    suspend fun appConfig(): AppConfig = get("/api/app/config")
    suspend fun authConfig(): AuthConfig = get("/api/auth/config")
    suspend fun banks(): List<Bank> = get("/api/study/banks")

    // ---------- Account ----------

    suspend fun me(): User? = get<MeResponse>("/api/auth/me").user
    suspend fun rename(name: String): User? = patch<MeResponse>("/api/auth/me", buildJsonObject { put("name", name) }).user

    suspend fun signIn(email: String, password: String, deviceKey: String, integrity: String?): SignInResult =
        post("/api/auth/signin", buildJsonObject {
            put("email", email); put("password", password); put("deviceKey", deviceKey); integrity?.let { put("integrity", it) }
        })

    suspend fun signUp(name: String, email: String, password: String, deviceKey: String, integrity: String?): SignInResult =
        post("/api/auth/signup", buildJsonObject {
            put("name", name); put("email", email); put("password", password); put("deviceKey", deviceKey); integrity?.let { put("integrity", it) }
        })

    suspend fun resendVerification(email: String, deviceKey: String, integrity: String?): StatusResult =
        post("/api/auth/resend-verification", buildJsonObject { put("email", email); put("deviceKey", deviceKey); integrity?.let { put("integrity", it) } })

    suspend fun forgotPassword(email: String, deviceKey: String, integrity: String?): StatusResult =
        post("/api/auth/forgot", buildJsonObject { put("email", email); put("deviceKey", deviceKey); integrity?.let { put("integrity", it) } })

    suspend fun phoneStart(phone: String, deviceKey: String, integrity: String?): StatusResult =
        post("/api/auth/phone/start", buildJsonObject { put("phone", phone); put("deviceKey", deviceKey); integrity?.let { put("integrity", it) } })

    suspend fun phoneVerify(phone: String, code: String, name: String?, deviceKey: String, integrity: String?): SignInResult =
        post("/api/auth/phone/verify", buildJsonObject {
            put("phone", phone); put("code", code); name?.let { put("name", it) }; put("deviceKey", deviceKey); integrity?.let { put("integrity", it) }
        })

    suspend fun googleNative(idToken: String, deviceKey: String, integrity: String?): SignInResult =
        post("/api/auth/google/native", buildJsonObject { put("idToken", idToken); put("deviceKey", deviceKey); integrity?.let { put("integrity", it) } })

    /* Ends the session on the server. The local secret is cleared whatever happens. */
    suspend fun signOut() {
        try { post<OkResponse>("/api/auth/signout") } finally { tokens.clear() }
    }

    suspend fun deleteAccount(password: String?) {
        post<OkResponse>("/api/auth/delete-account", buildJsonObject { password?.let { put("password", it) } })
        tokens.clear()
    }

    // ---------- Devices ----------

    suspend fun claimDevice(deviceKey: String, label: String, integrity: String?): ClaimResult {
        val r = post<ClaimResponse>("/api/device/claim", buildJsonObject {
            put("deviceKey", deviceKey); put("label", label); integrity?.let { put("integrity", it) }
        })
        return when (r.status) {
            "device_limit" -> ClaimResult.DeviceLimit(r.devices)
            "takeover_limit" -> ClaimResult.TakeoverLimit(r.nextAllowedAt)
            else -> ClaimResult.Active
        }
    }

    suspend fun checkDevice(deviceKey: String): CheckResult {
        val r = post<CheckResponse>("/api/device/check", buildJsonObject { put("deviceKey", deviceKey) })
        return when (r.status) {
            "active" -> CheckResult.Active
            "locked" -> CheckResult.Locked(r.activeLabel)
            else -> CheckResult.Idle
        }
    }

    suspend fun devices(): List<Device> = get("/api/device/list")

    suspend fun removeDevice(id: String): RemoveResult {
        val r = post<RemoveResponse>("/api/device/remove", buildJsonObject { put("id", id) })
        return when (r.status) {
            "removed" -> RemoveResult.Removed(r.devices)
            "swap_limit" -> RemoveResult.SwapLimit(r.nextAllowedAt)
            else -> RemoveResult.NotFound
        }
    }

    // ---------- Study ----------

    suspend fun catalog(bank: String): Catalog = get("/api/study/catalog" + q("bank" to bank))

    suspend fun pool(bank: String, subjects: List<String>, chapters: List<String>): Pool =
        get("/api/study/pool" + q("bank" to bank, "subjects" to subjects.joinToString("|"), "chapters" to chapters.joinToString("|")))

    suspend fun start(request: StartRequest): StartResult = post("/api/study/start", json.encodeToJsonElement(request))

    suspend fun attempt(id: String): AttemptResult {
        val e = call(HttpMethod.Get, "/api/study/attempt" + q("id" to id))
        val finished = (e as? JsonObject)?.get("finished")?.jsonPrimitive?.booleanOrNull == true
        return if (finished) AttemptResult.Finished(e.jsonObject["id"]?.jsonPrimitive?.contentOrNull ?: id)
        else AttemptResult.Open(json.decodeFromJsonElement(Sitting.serializer(), e))
    }

    suspend fun answer(id: String, idx: Int, answer: Int?, flagged: Boolean, seconds: Int?) {
        post<OkResponse>("/api/study/answer", answerBody(id, idx, answer, flagged, seconds))
    }

    suspend fun check(id: String, idx: Int, answer: Int, seconds: Int?): CheckAnswerResult =
        post("/api/study/check", buildJsonObject { put("id", id); put("idx", idx); put("answer", answer); seconds?.let { put("seconds", it) } })

    /* Practice only: the key and explanation of question idx before it is answered, so Submit shows them at once. The
       answer is then locked in with checkQuiet, which sends nothing back but the saved answer. */
    suspend fun peek(id: String, idx: Int): Peek = get("/api/study/peek" + q("id" to id, "idx" to idx.toString()))
    suspend fun checkQuiet(id: String, idx: Int, answer: Int, seconds: Int?): Int =
        post<QuietCheck>("/api/study/check", buildJsonObject { put("id", id); put("idx", idx); put("answer", answer); put("quiet", true); seconds?.let { put("seconds", it) } }).answer

    suspend fun finish(id: String): FinishResult = post("/api/study/finish", buildJsonObject { put("id", id) })
    suspend fun review(id: String): Review = get("/api/study/review" + q("id" to id))
    suspend fun history(): List<TestResult> = get<HistoryResponse>("/api/study/history").tests
    suspend fun dashboard(bank: String? = null): Dashboard = get("/api/study/dashboard" + q("bank" to bank))
    suspend fun mistakes(): List<Mistake> = get<MistakesResponse>("/api/study/mistakes").mistakes
    suspend fun bookmarks(): List<FullQuestion> = get<BookmarksResponse>("/api/study/bookmarks").bookmarks

    suspend fun bookmark(questionId: String, on: Boolean): Boolean =
        post<BookmarkResult>("/api/study/bookmark", buildJsonObject { put("questionId", questionId); put("on", on) }).on

    suspend fun report(questionId: String, reason: String, details: String) {
        post<OkResponse>("/api/study/report", buildJsonObject { put("questionId", questionId); put("reason", reason); put("details", details) })
    }

    /* Sends a request saved in the outbox, as it was saved. */
    suspend fun replay(path: String, body: JsonElement) { call(HttpMethod.Post, path, body) }

    // ---------- Offline ----------

    suspend fun pack(deviceKey: String, integrity: String?, bank: String, subjects: List<String>, chapters: List<String>, count: Int): PackResponse =
        post("/api/study/pack", buildJsonObject {
            put("deviceKey", deviceKey); integrity?.let { put("integrity", it) }
            put("bank", bank); put("count", count)
            if (subjects.isNotEmpty()) put("subjects", JsonArray(subjects.map(::JsonPrimitive)))
            if (chapters.isNotEmpty()) put("chapters", JsonArray(chapters.map(::JsonPrimitive)))
        })

    suspend fun renewPacks(deviceKey: String): RenewResponse = post("/api/study/pack/renew", buildJsonObject { put("deviceKey", deviceKey) })

    suspend fun releasePack(deviceKey: String, id: String) {
        post<OkResponse>("/api/study/pack/release", buildJsonObject { put("deviceKey", deviceKey); put("id", id) })
    }

    suspend fun sync(deviceKey: String, sessions: List<SyncSession>): List<String> =
        post<SyncResponse>("/api/study/sync", buildJsonObject {
            put("deviceKey", deviceKey); put("sessions", json.encodeToJsonElement(sessions))
        }).accepted

    companion object {
        val json = Json { ignoreUnknownKeys = true; explicitNulls = false; coerceInputValues = true; encodeDefaults = false }

        fun answerBody(id: String, idx: Int, answer: Int?, flagged: Boolean, seconds: Int?): JsonObject = buildJsonObject {
            put("id", id); put("idx", idx); put("answer", answer); put("flagged", flagged); seconds?.let { put("seconds", it) }
        }
    }
}
