package pk.examwise.app.data

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import pk.examwise.core.api.TokenStore
import pk.examwise.core.offline.Clock

private val Context.store by preferencesDataStore(name = "examwise")

/* Small settings on the phone. Secrets are stored only after SecureBox has encrypted them. */
class Prefs(private val context: Context) {
    private object K {
        val token = stringPreferencesKey("token_enc")
        val dbPass = stringPreferencesKey("db_pass_enc")
        val textSize = intPreferencesKey("text_size")
        val clockOffset = longPreferencesKey("clock_offset")
        val clockHigh = longPreferencesKey("clock_high")
        val owner = stringPreferencesKey("offline_owner")
        val bank = stringPreferencesKey("bank")
    }

    private suspend fun <T> read(key: Preferences.Key<T>): T? = context.store.data.first()[key]
    private suspend fun <T> write(key: Preferences.Key<T>, value: T?) {
        context.store.edit { if (value == null) it.remove(key) else it[key] = value }
    }

    suspend fun sealedToken() = read(K.token)
    suspend fun setSealedToken(v: String?) = write(K.token, v)
    suspend fun sealedDbPass() = read(K.dbPass)
    suspend fun setSealedDbPass(v: String?) = write(K.dbPass, v)

    /* Question text size: 0, 1 or 2. */
    val textSize: Flow<Int> = context.store.data.map { it[K.textSize] ?: 0 }
    suspend fun setTextSize(v: Int) = write(K.textSize, v)

    suspend fun clock() = Clock(read(K.clockOffset) ?: 0L, read(K.clockHigh) ?: 0L)
    suspend fun setClock(c: Clock) { context.store.edit { it[K.clockOffset] = c.offset; it[K.clockHigh] = c.highestSeen } }

    /* Whose offline answers are on this phone, so they are only ever sent for that account. */
    suspend fun offlineOwner() = read(K.owner)
    suspend fun setOfflineOwner(v: String?) = write(K.owner, v)

    suspend fun lastBank() = read(K.bank)
    suspend fun setLastBank(v: String) = write(K.bank, v)
}

/* The session secret, encrypted with the Keystore key. */
class KeystoreTokenStore(private val prefs: Prefs) : TokenStore {
    @Volatile private var cached: String? = null
    @Volatile private var loaded = false

    override suspend fun token(): String? {
        if (!loaded) {
            cached = prefs.sealedToken()?.let { SecureBox.decrypt(it)?.decodeToString() }
            loaded = true
        }
        return cached
    }

    override suspend fun save(token: String) {
        cached = token; loaded = true
        prefs.setSealedToken(SecureBox.encrypt(token.toByteArray()))
    }

    override suspend fun clear() {
        cached = null; loaded = true
        prefs.setSealedToken(null)
    }
}
