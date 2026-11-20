package com.markhorprep.app

import android.app.Application
import android.os.Build
import android.provider.Settings
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import com.markhorprep.app.data.AccountRepository
import com.markhorprep.app.data.Cache
import com.markhorprep.app.data.ConfigRepository
import com.markhorprep.app.data.Integrity
import com.markhorprep.app.data.KeystoreTokenStore
import com.markhorprep.app.data.OfflineRepository
import com.markhorprep.app.data.Outbox
import com.markhorprep.app.data.Prefs
import com.markhorprep.app.data.StudyRepository
import com.markhorprep.app.data.db.AppDatabase
import com.markhorprep.core.api.MarkhorPrepApi
import com.markhorprep.core.device.DeviceKey

/* Builds everything once, by hand: storage, the API client and the repositories the screens use. */
class AppContainer(val app: Application) {
    val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    val prefs = Prefs(app)
    val tokens = KeystoreTokenStore(prefs)
    val api = MarkhorPrepApi(BuildConfig.API_BASE, BuildConfig.VERSION_CODE, tokens)

    val deviceKey: String by lazy {
        DeviceKey.fromAndroidId(Settings.Secure.getString(app.contentResolver, Settings.Secure.ANDROID_ID) ?: "unknown")
    }
    val deviceLabel: String = DeviceKey.label(Build.MANUFACTURER ?: "", Build.MODEL ?: "", runCatching { Settings.Global.getString(app.contentResolver, Settings.Global.DEVICE_NAME) }.getOrNull())

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
