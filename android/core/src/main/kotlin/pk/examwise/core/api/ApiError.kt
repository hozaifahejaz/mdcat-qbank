package pk.examwise.core.api

import kotlinx.serialization.json.JsonObject

/* Any answer that isn't 2xx, read from the server's { error: { code, message, ...extra } }.
   status 0 means the request never reached the server. message is written for students and can be shown as is. */
class ApiError(
    val status: Int,
    val code: String,
    override val message: String,
    val extra: JsonObject = JsonObject(emptyMap()),
) : Exception(message) {
    val isOffline: Boolean get() = status == 0

    companion object {
        const val OFFLINE_MESSAGE = "You seem to be offline. Check your connection and try again."
        fun offline() = ApiError(0, "offline", OFFLINE_MESSAGE)
    }
}

/* Events any screen can cause and the navigation host answers, wherever the student is. */
sealed interface SessionEvent {
    data object SignedOut : SessionEvent
    data object Locked : SessionEvent
    data object UpdateRequired : SessionEvent
    data class IntegrityFailed(val message: String) : SessionEvent
}

/* Where the session secret lives. The app keeps it encrypted with a Keystore key; tests keep it in memory. */
interface TokenStore {
    suspend fun token(): String?
    suspend fun save(token: String)
    suspend fun clear()
}

class MemoryTokenStore(private var value: String? = null) : TokenStore {
    override suspend fun token() = value
    override suspend fun save(token: String) { value = token }
    override suspend fun clear() { value = null }
}
