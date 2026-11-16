package pk.examwise.app.data

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.builtins.ListSerializer
import pk.examwise.core.api.ApiError
import pk.examwise.core.api.ExamwiseApi
import pk.examwise.core.model.AppConfig
import pk.examwise.core.model.AuthConfig
import pk.examwise.core.model.Bank
import pk.examwise.core.model.Catalog
import pk.examwise.core.model.CheckResult
import pk.examwise.core.model.ClaimResult
import pk.examwise.core.model.Dashboard
import pk.examwise.core.model.Device
import pk.examwise.core.model.RemoveResult
import pk.examwise.core.model.SignInResult
import pk.examwise.core.model.Sitting
import pk.examwise.core.model.StartRequest
import pk.examwise.core.model.StartResult
import pk.examwise.core.model.TestResult
import pk.examwise.core.model.User

/* App settings from the server: which versions still work, switches, support links. Falls back to the last copy
   when offline. */
class ConfigRepository(private val api: ExamwiseApi, private val cache: Cache, private val integrity: Integrity) {
    private val _config = MutableStateFlow<AppConfig?>(null)
    val config: StateFlow<AppConfig?> = _config.asStateFlow()

    suspend fun load(): AppConfig? {
        val c = try {
            api.appConfig().also { cache.put("config", AppConfig.serializer(), it) }
        } catch (e: ApiError) {
            cache.get("config", AppConfig.serializer())
        }
        _config.value = c
        integrity.prepare(c?.integrity?.cloudProjectNumber)
        return c
    }

    suspend fun authConfig(): AuthConfig = try { api.authConfig() } catch (e: ApiError) { AuthConfig() }
}

/* The signed-in account and this phone's place among its devices. */
class AccountRepository(
    private val api: ExamwiseApi,
    private val cache: Cache,
    private val tokens: KeystoreTokenStore,
    private val integrity: Integrity,
    val deviceKey: () -> String,
    val deviceLabel: String,
) {
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()

    suspend fun hasSession(): Boolean = tokens.token() != null

    /* The account from the server; the cached copy when offline. Null when signed out. */
    suspend fun refresh(): User? {
        val u = try {
            api.me().also { if (it != null) cache.put("me", User.serializer(), it) }
        } catch (e: ApiError) {
            if (e.isOffline) cache.get("me", User.serializer()) else throw e
        }
        _user.value = u
        return u
    }

    fun setUser(u: User?) { _user.value = u }

    suspend fun signIn(email: String, password: String): SignInResult =
        api.signIn(email.trim(), password, deviceKey(), integrity.token("auth"))

    suspend fun signUp(name: String, email: String, password: String): SignInResult =
        api.signUp(name.trim(), email.trim(), password, deviceKey(), integrity.token("auth"))

    suspend fun resend(email: String) = api.resendVerification(email.trim(), deviceKey(), integrity.token("auth"))
    suspend fun forgot(email: String) = api.forgotPassword(email.trim(), deviceKey(), integrity.token("auth"))
    suspend fun phoneStart(phone: String) = api.phoneStart(phone, deviceKey(), integrity.token("auth"))
    suspend fun phoneVerify(phone: String, code: String, name: String?) = api.phoneVerify(phone, code, name, deviceKey(), integrity.token("auth"))
    suspend fun google(idToken: String) = api.googleNative(idToken, deviceKey(), integrity.token("auth"))

    suspend fun claim(): ClaimResult = api.claimDevice(deviceKey(), deviceLabel, integrity.token("claim"))
    suspend fun check(): CheckResult = api.checkDevice(deviceKey())
    suspend fun devices(): List<Device> = api.devices()
    suspend fun removeDevice(id: String): RemoveResult = api.removeDevice(id)

    suspend fun rename(name: String): User? = api.rename(name.trim())?.also { _user.value = it; cache.put("me", User.serializer(), it) }

    /* Ends the session on the server when it can; the phone forgets it either way. */
    suspend fun signOut() {
        runCatching { api.signOut() }
        tokens.clear()
        _user.value = null
    }

    suspend fun deleteAccount(password: String?) {
        api.deleteAccount(password)
        _user.value = null
    }
}

/* Questions, tests and the student's numbers. Lists are cached so screens can draw at once; questions are not. */
class StudyRepository(private val api: ExamwiseApi, private val cache: Cache) {
    /* The sitting a start just returned, so the player doesn't fetch it again. */
    private var started: Sitting? = null

    suspend fun banks(): List<Bank> = api.banks().also { cache.put("banks", ListSerializer(Bank.serializer()), it) }
    suspend fun cachedBanks(): List<Bank>? = cache.get("banks", ListSerializer(Bank.serializer()))

    suspend fun catalog(bank: String): Catalog = api.catalog(bank).also { cache.put("catalog:$bank", Catalog.serializer(), it) }
    suspend fun cachedCatalog(bank: String): Catalog? = cache.get("catalog:$bank", Catalog.serializer())

    suspend fun dashboard(): Dashboard = api.dashboard().also { cache.put("dashboard", Dashboard.serializer(), it) }
    suspend fun cachedDashboard(): Dashboard? = cache.get("dashboard", Dashboard.serializer())

    suspend fun history(): List<TestResult> = api.history().also { cache.put("history", ListSerializer(TestResult.serializer()), it) }
    suspend fun cachedHistory(): List<TestResult>? = cache.get("history", ListSerializer(TestResult.serializer()))

    suspend fun pool(bank: String, subjects: List<String>, chapters: List<String>) = api.pool(bank, subjects, chapters)

    private var shortNote: Pair<String, String>? = null

    suspend fun start(r: StartRequest): StartResult = api.start(r).also {
        started = it.attempt
        shortNote = if (it.short) it.id to "Only ${it.count} question${if (it.count == 1) "" else "s"} matched your picks, so this set has ${it.count}." else null
    }

    fun takeStarted(id: String): Sitting? = started?.takeIf { it.id == id }.also { started = null }
    fun takeShortNote(id: String): String? = shortNote?.takeIf { it.first == id }?.second.also { shortNote = null }

    suspend fun attempt(id: String) = api.attempt(id)
    suspend fun check(id: String, idx: Int, answer: Int, seconds: Int?) = api.check(id, idx, answer, seconds)
    suspend fun finish(id: String) = api.finish(id)
    suspend fun review(id: String) = api.review(id)
    suspend fun mistakes() = api.mistakes()
    suspend fun bookmarks() = api.bookmarks()
}
