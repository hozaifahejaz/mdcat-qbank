package pk.examwise.core.device

import java.security.MessageDigest
import java.util.Base64

object DeviceKey {
    /* SHA-256("examwise|" + ANDROID_ID), first 16 bytes in UUID form, so it passes the server's existing check and
       stays the same across reinstalls. */
    fun fromAndroidId(androidId: String): String {
        val h = MessageDigest.getInstance("SHA-256").digest("examwise|$androidId".toByteArray()).take(16)
        val hex = h.joinToString("") { "%02x".format(it) }
        return "${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}"
    }

    /* "Android app on Samsung SM-A155F", like the website's "Chrome on Mac". The phone's own name (Settings, About
       phone) wins when it has one. Build codes such as "sdk_gphone64_arm64" mean nothing to a student, so those
       give plain "Android app". Limited to what the server's cleanLabel keeps. */
    fun label(manufacturer: String, model: String, deviceName: String? = null): String {
        val maker = manufacturer.trim().replaceFirstChar { it.uppercase() }
        val name = deviceName?.trim()?.takeIf { it.isNotEmpty() && !it.contains('_') }
            ?: if (model.startsWith(manufacturer, ignoreCase = true)) model else "$maker $model"
        val clean = name.replace(Regex("[^A-Za-z0-9 ._-]"), "").replace(Regex("\\s+"), " ").trim()
        if (clean.isEmpty() || name.contains('_')) return "Android app"
        return "Android app on $clean".take(60)
    }

    /* The request hash for Play Integrity: base64url SHA-256 of "action|deviceKey", without padding. */
    fun requestHash(action: String, deviceKey: String): String {
        val d = MessageDigest.getInstance("SHA-256").digest("$action|$deviceKey".toByteArray())
        return Base64.getUrlEncoder().withoutPadding().encodeToString(d)
    }
}
