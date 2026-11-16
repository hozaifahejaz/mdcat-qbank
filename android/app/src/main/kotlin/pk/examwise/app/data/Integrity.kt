package pk.examwise.app.data

import android.content.Context
import com.google.android.gms.tasks.Task
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.StandardIntegrityManager.PrepareIntegrityTokenRequest
import com.google.android.play.core.integrity.StandardIntegrityManager.StandardIntegrityTokenProvider
import com.google.android.play.core.integrity.StandardIntegrityManager.StandardIntegrityTokenRequest
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import pk.examwise.core.device.DeviceKey
import kotlin.coroutines.resume

/* Play Integrity standard requests. Prepared once with the cloud project number from /api/app/config; with no
   number, nothing is asked and no token is sent. If Google Play can't give a token, the request goes without one
   and the server decides. */
class Integrity(private val context: Context, private val deviceKey: () -> String) {
    private var provider: StandardIntegrityTokenProvider? = null
    private var preparedFor: Long? = null
    private val lock = Mutex()

    suspend fun prepare(cloudProjectNumber: Long?) {
        if (cloudProjectNumber == null) { provider = null; preparedFor = null; return }
        lock.withLock {
            if (preparedFor == cloudProjectNumber && provider != null) return
            provider = runCatching {
                IntegrityManagerFactory.createStandard(context)
                    .prepareIntegrityToken(PrepareIntegrityTokenRequest.builder().setCloudProjectNumber(cloudProjectNumber).build())
                    .await()
            }.getOrNull()
            preparedFor = if (provider != null) cloudProjectNumber else null
        }
    }

    /* action is auth, claim or pack. */
    suspend fun token(action: String): String? {
        val p = provider ?: return null
        val hash = DeviceKey.requestHash(action, deviceKey())
        return runCatching { p.request(StandardIntegrityTokenRequest.builder().setRequestHash(hash).build()).await()?.token() }.getOrNull()
    }
}

private suspend fun <T> Task<T>.await(): T? = suspendCancellableCoroutine { cont ->
    addOnSuccessListener { cont.resume(it) }
    addOnFailureListener { cont.resume(null) }
    addOnCanceledListener { cont.resume(null) }
}
