package pk.examwise.app

import android.annotation.SuppressLint
import android.app.Application
import android.os.Build
import android.provider.Settings
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import pk.examwise.app.data.AccountRepository
import pk.examwise.app.data.Cache
import pk.examwise.app.data.ConfigRepository
import pk.examwise.app.data.Integrity
import pk.examwise.app.data.KeystoreTokenStore
import pk.examwise.app.data.OfflineRepository
import pk.examwise.app.data.Outbox
import pk.examwise.app.data.Prefs
import pk.examwise.app.data.StudyRepository
import pk.examwise.app.data.db.AppDatabase
import pk.examwise.core.api.ExamwiseApi
import pk.examwise.core.device.DeviceKey

/* Builds everything once, by hand: storage, the API client and the repositories the screens use. */
class AppContainer(val app: Application) {
    val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    val prefs = Prefs(app)
    val tokens = KeystoreTokenStore(prefs)
    val api = ExamwiseApi(BuildConfig.API_BASE, BuildConfig.VERSION_CODE, tokens)

    @SuppressLint("HardwareIds")
    val deviceKey: String by lazy {
        DeviceKey.fromAndroidId(Settings.Secure.getString(app.contentResolver, Settings.Secure.ANDROID_ID) ?: "unknown")
    }
    val deviceLabel: String = DeviceKey.label(Build.MANUFACTURER ?: "", Build.MODEL ?: "")

    private val dbLock = Mutex()
    @Volatile private var database: AppDatabase? = null
    suspend fun db(): AppDatabase = database ?: dbLock.withLock { database ?: AppDatabase.open(app, prefs).also { database = it } }

    val cache = Cache(::db)
    val integrity = Integrity(app) { deviceKey }
    val config = ConfigRepository(api, cache, integrity)
    val account = AccountRepository(api, cache, tokens, integrity, { deviceKey }, deviceLabel)
    val study = StudyRepository(api, cache)
    val outbox = Outbox(::db, api, scope)
    val offline = OfflineRepository(::db, api, prefs, integrity, outbox, { deviceKey })

    /* Everything tied to the account goes when the student signs out. Unsent offline answers stay for the same
       account, since they hold only the student's own answers. */
    suspend fun forgetAccount() {
        offline.wipePacks()
        cache.clear()
    }
}
