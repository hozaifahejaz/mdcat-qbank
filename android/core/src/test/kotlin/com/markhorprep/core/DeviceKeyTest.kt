package com.markhorprep.core

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import com.markhorprep.core.device.DeviceKey

class DeviceKeyTest {
    @Test fun keyIsAStableUuidShape() {
        val k = DeviceKey.fromAndroidId("9774d56d682e549c")
        assertTrue(k, Regex("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$").matches(k))
        assertEquals(k, DeviceKey.fromAndroidId("9774d56d682e549c"))
    }

    @Test fun labelKeepsOnlyServerSafeCharacters() {
        assertEquals("Android app on Samsung SM-A155F", DeviceKey.label("samsung", "SM-A155F"))
        assertEquals("Android app on Google Pixel 8", DeviceKey.label("Google", "Pixel 8"))
        assertEquals("Android app on Xiaomi Redmi Note 13", DeviceKey.label("Xiaomi", "Xiaomi Redmi Note 13"))
        assertEquals("Android app on OnePlus CPH2581 5G", DeviceKey.label("OnePlus", "CPH2581 (5G)"))
        assertEquals("Android app on Alis Pixel", DeviceKey.label("Google", "Pixel 8", "Ali's Pixel"))
        assertEquals("Android app", DeviceKey.label("Google", "sdk_gphone64_arm64", "sdk_gphone64_arm64"))
        assertEquals("Android app", DeviceKey.label("Google", "sdk_gphone64_arm64"))
    }

    @Test fun requestHashMatchesTheServer() {
        // Same as server/integrity.ts requestHash, worked out with Node's crypto.
        assertEquals("9O_1x9FikS1s1fFsnvKHj5Jpw56SXel9Q_ogEA4vtVI", DeviceKey.requestHash("claim", "00000000-0000-0000-0000-000000000000"))
    }
}
