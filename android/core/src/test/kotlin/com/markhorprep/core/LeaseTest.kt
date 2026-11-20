package com.markhorprep.core

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import com.markhorprep.core.offline.Lease

class LeaseTest {
    private val day = 24 * 60 * 60 * 1000L

    @Test fun usableUntilItExpires() {
        val clock = Lease.renewed(serverNow = 1_000_000, phoneNow = 1_000_000)
        assertTrue(Lease.usable(1_000_000 + 7 * day, 1_000_000 + day, clock))
        assertFalse(Lease.usable(1_000_000 + 7 * day, 1_000_000 + 8 * day, clock))
    }

    @Test fun usesTheServerClockNotThePhones() {
        // The phone runs a day slow: its own reading would say the pack is still fine.
        val clock = Lease.renewed(serverNow = 10 * day, phoneNow = 9 * day)
        assertFalse(Lease.usable(17 * day, 16 * day + 1, clock))
    }

    @Test fun clockSetBackLocksEverything() {
        var clock = Lease.renewed(serverNow = 10 * day, phoneNow = 10 * day)
        clock = Lease.seen(12 * day, clock)
        assertTrue(Lease.clockWentBack(11 * day, clock))
        assertFalse(Lease.usable(17 * day, 11 * day, clock))
        // Until the next renew.
        clock = Lease.renewed(serverNow = 12 * day, phoneNow = 11 * day)
        assertTrue(Lease.usable(19 * day, 11 * day + 1, clock))
    }
}
