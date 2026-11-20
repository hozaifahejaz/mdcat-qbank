package com.markhorprep.core.offline

/* Trusted time for offline packs: the phone's clock plus the last known difference to the server's clock. If the
   phone's clock ever reads earlier than the latest trusted time already seen, it was set back, and every pack is
   treated as expired until the next renew from the server. */
data class Clock(val offset: Long, val highestSeen: Long)

object Lease {
    /* Offset from a server answer that carried its own `now`. */
    fun offset(serverNow: Long, phoneNow: Long): Long = serverNow - phoneNow

    fun trustedNow(phoneNow: Long, clock: Clock): Long = phoneNow + clock.offset

    /* True when the phone's clock was moved back since we last looked. */
    fun clockWentBack(phoneNow: Long, clock: Clock): Boolean = trustedNow(phoneNow, clock) < clock.highestSeen - TOLERANCE_MS

    fun usable(expiresAt: Long, phoneNow: Long, clock: Clock): Boolean =
        !clockWentBack(phoneNow, clock) && trustedNow(phoneNow, clock) < expiresAt

    /* The new highest trusted time to store after looking at the clock. */
    fun seen(phoneNow: Long, clock: Clock): Clock =
        if (clockWentBack(phoneNow, clock)) clock else clock.copy(highestSeen = maxOf(clock.highestSeen, trustedNow(phoneNow, clock)))

    /* After a renew the server's clock is the truth again. */
    fun renewed(serverNow: Long, phoneNow: Long): Clock = Clock(offset(serverNow, phoneNow), serverNow)

    /* Small allowance for the phone's own clock adjustments. */
    const val TOLERANCE_MS = 2 * 60 * 1000L
}
