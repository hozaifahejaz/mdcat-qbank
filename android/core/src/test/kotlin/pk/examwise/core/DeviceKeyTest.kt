package pk.examwise.core

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import pk.examwise.core.device.DeviceKey

class DeviceKeyTest {
    @Test fun keyIsAStableUuidShape() {
        val k = DeviceKey.fromAndroidId("9774d56d682e549c")
        assertTrue(k, Regex("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$").matches(k))
        assertEquals(k, DeviceKey.fromAndroidId("9774d56d682e549c"))
    }

    @Test fun labelKeepsOnlyServerSafeCharacters() {
        assertEquals("Samsung SM-A155F", DeviceKey.label("samsung", "SM-A155F"))
        assertEquals("Google Pixel 8", DeviceKey.label("Google", "Pixel 8"))
        assertEquals("Xiaomi Redmi Note 13", DeviceKey.label("Xiaomi", "Xiaomi Redmi Note 13"))
        assertEquals("OnePlus CPH2581 5G", DeviceKey.label("OnePlus", "CPH2581 (5G)"))
    }

    @Test fun requestHashMatchesTheServer() {
        // Same as server/integrity.ts requestHash, worked out with Node's crypto.
        assertEquals("9O_1x9FikS1s1fFsnvKHj5Jpw56SXel9Q_ogEA4vtVI", DeviceKey.requestHash("claim", "00000000-0000-0000-0000-000000000000"))
    }
}
