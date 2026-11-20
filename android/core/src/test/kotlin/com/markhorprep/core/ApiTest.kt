package com.markhorprep.core

import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.MockRequestHandleScope
import io.ktor.client.engine.mock.respond
import io.ktor.client.engine.mock.toByteArray
import io.ktor.client.request.HttpRequestData
import io.ktor.client.request.HttpResponseData
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.headersOf
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Test
import com.markhorprep.core.api.ApiError
import com.markhorprep.core.api.MarkhorPrepApi
import com.markhorprep.core.api.MemoryTokenStore
import com.markhorprep.core.api.SessionEvent
import com.markhorprep.core.model.AttemptResult
import com.markhorprep.core.model.CheckResult
import com.markhorprep.core.model.ClaimResult
import com.markhorprep.core.model.Filter
import com.markhorprep.core.model.RemoveResult
import com.markhorprep.core.model.StartRequest

class ApiTest {
    private class Recorded(val method: String, val path: String, val headers: Map<String, String>, val body: JsonObject?)

    private val seen = mutableListOf<Recorded>()

    private fun api(tokens: MemoryTokenStore = MemoryTokenStore("secret-token-1234567890"), reply: suspend MockRequestHandleScope.(HttpRequestData) -> HttpResponseData): MarkhorPrepApi {
        val engine = MockEngine { req ->
            val text = req.body.toByteArray().decodeToString()
            seen += Recorded(
                req.method.value, req.url.encodedPathAndQuery,
                req.headers.entries().associate { it.key to it.value.joinToString() } + listOfNotNull(req.body.contentType?.let { HttpHeaders.ContentType to it.toString() }),
                if (text.isBlank()) null else Json.parseToJsonElement(text).jsonObject,
            )
            reply(req)
        }
        return MarkhorPrepApi("https://example.test/", 7, tokens, engine)
    }

    private fun MockRequestHandleScope.ok(body: String) =
        respond(body, HttpStatusCode.OK, headersOf(HttpHeaders.ContentType, "application/json"))

    private fun MockRequestHandleScope.err(status: Int, code: String, message: String = "msg", extra: String = "") =
        respond("""{"error":{"code":"$code","message":"$message"$extra}}""", HttpStatusCode.fromValue(status), headersOf(HttpHeaders.ContentType, "application/json"))

    @Test fun sendsTheAppHeadersAndBearer() = runTest {
        val a = api { ok("""{"user":null}""") }
        assertNull(a.me())
        val h = seen.single().headers
        assertEquals("Bearer secret-token-1234567890", h["Authorization"])
        assertEquals("android", h["X-Client"])
        assertEquals("7", h["X-App-Version"])
        assertTrue(h["User-Agent"]!!.startsWith("MarkhorPrep-Android"))
    }

    @Test fun noBearerWhenSignedOut() = runTest {
        val a = api(MemoryTokenStore()) { ok("""{"email":true,"phone":true,"google":false,"turnstileSiteKey":""}""") }
        val c = a.authConfig()
        assertTrue(c.phone)
        assertFalse(c.google)
        assertNull(seen.single().headers["Authorization"])
    }

    @Test fun signInStoresTheToken() = runTest {
        val tokens = MemoryTokenStore()
        val a = api(tokens) { ok("""{"ok":true,"token":"new-token-abcdefghijklmnop","expiresAt":123}""") }
        val r = a.signIn("a@b.pk", "password1", "00000000-0000-0000-0000-000000000000", null)
        assertTrue(r.ok)
        assertEquals("new-token-abcdefghijklmnop", tokens.token())
        val body = seen.single().body!!
        assertEquals("a@b.pk", body["email"]!!.jsonPrimitive.content)
        assertEquals("00000000-0000-0000-0000-000000000000", body["deviceKey"]!!.jsonPrimitive.content)
        assertTrue(seen.single().headers[HttpHeaders.ContentType]!!.startsWith("application/json"))
    }

    @Test fun appConfigAndBanks() = runTest {
        val a = api { req ->
            if (req.url.encodedPath.endsWith("config")) ok("""{"minVersion":3,"latestVersion":5,"checkinSeconds":60,"examDate":"2027-09-01","paper":[{"subject":"Biology","count":81}],"offline":{"enabled":true,"maxQuestions":300,"leaseDays":7},"integrity":{"cloudProjectNumber":null},"google":{"webClientId":"abc.apps.googleusercontent.com"},"support":{"email":"help@markhorprep.com"},"later":1}""")
            else ok("""[{"id":"mdcat","name":"MDCAT","short":"MDCAT","blurb":"x","subjects":[{"name":"Biology","chapters":["Cell"]}]}]""")
        }
        val c = a.appConfig()
        assertEquals(3, c.minVersion)
        assertTrue(c.offline.enabled)
        assertNull(c.integrity.cloudProjectNumber)
        assertEquals("abc.apps.googleusercontent.com", c.google.webClientId)
        assertEquals("Cell", a.banks().single().subjects.single().chapters.single())
    }

    @Test fun deviceClaimShapes() = runTest {
        var reply = """{"status":"active","takeovers_today":0}"""
        val tokens = MemoryTokenStore("old-token-abcdefghijklmn")
        val a = api(tokens) { ok(reply) }
        assertEquals(ClaimResult.Active, a.claimDevice("k", "Pixel", null))
        reply = """{"status":"device_limit","devices":[{"id":"d1","label":"Laptop","created_at":1,"last_seen_at":2,"active":false}]}"""
        assertEquals("Laptop", (a.claimDevice("k", "Pixel", null) as ClaimResult.DeviceLimit).devices.single().label)
        reply = """{"status":"takeover_limit","next_allowed_at":"2026-11-17T00:00:00Z"}"""
        assertEquals("2026-11-17T00:00:00Z", (a.claimDevice("k", "Pixel", null) as ClaimResult.TakeoverLimit).nextAllowedAt)
        // A takeover replaces the secret.
        reply = """{"status":"active","takeovers_today":1,"token":"taken-over-token-abcdefgh"}"""
        a.claimDevice("k", "Pixel", "tok")
        assertEquals("taken-over-token-abcdefgh", tokens.token())
    }

    @Test fun deviceCheckListRemove() = runTest {
        var reply = """{"status":"locked","active_label":"Chrome on Windows"}"""
        val a = api { ok(reply) }
        assertEquals(CheckResult.Locked("Chrome on Windows"), a.checkDevice("k"))
        reply = """{"status":"idle"}"""
        assertEquals(CheckResult.Idle, a.checkDevice("k"))
        reply = """[{"id":"d1","label":"Pixel","created_at":1,"last_seen_at":2,"active":true,"platform":"android"}]"""
        assertEquals("android", a.devices().single().platform)
        reply = """{"status":"swap_limit","next_allowed_at":"2026-12-01"}"""
        assertEquals(RemoveResult.SwapLimit("2026-12-01"), a.removeDevice("d1"))
        reply = """{"status":"removed","devices":[]}"""
        assertEquals(RemoveResult.Removed(emptyList()), a.removeDevice("d1"))
    }

    private val sitting = """{"id":"t1","kind":"practice","mode":"tutor","title":"Chemistry","startedAt":1,"deadlineAt":null,"now":5,
        "items":[{"idx":0,"q":{"id":"CHE-0001","subject":"Chemistry","chapter":"Atoms","topic":"Mole","stem":"S","options":["a","b","c","d"]},
        "answer":null,"flagged":false,"checked":false,"bookmarked":false,"seconds":null,"reveal":null,"stats":null}]}"""

    @Test fun studyEndpoints() = runTest {
        val a = api { req ->
            val p = req.url.encodedPath
            when {
                p.endsWith("/catalog") -> ok("""{"paid":false,"bank":"nums","chapters":[{"subject":"Biology","chapter":"Cell","total":50,"open":10,"answered":3,"correct":2}],"papers":[{"year":2026,"count":180}],"mocks":12,"mockReady":true,"miniReady":true,"miniUsed":false,"miniOpen":null}""")
                p.endsWith("/pool") -> ok("""{"total":50,"unused":40,"incorrect":3,"marked":2,"omitted":1,"correct":6,"markedIn":{"unused":1,"incorrect":1,"omitted":0,"correct":0}}""")
                p.endsWith("/start") -> ok("""{"id":"t1","count":1,"short":true,"attempt":$sitting}""")
                p.endsWith("/attempt") -> if (req.url.parameters["id"] == "done") ok("""{"finished":true,"id":"done"}""") else ok(sitting)
                p.endsWith("/check") -> ok("""{"answer":2,"reveal":{"id":"CHE-0001","subject":"Chemistry","stem":"S","options":["a","b","c","d"],"answer":2,"why":"W","wrong":{"0":"no","1":"no","3":"no"}},"stats":{"n":25,"picks":[5,5,10,5]}}""")
                p.endsWith("/answer") -> ok("""{"ok":true}""")
                p.endsWith("/finish") -> ok("""{"id":"t1","empty":false}""")
                p.endsWith("/review") -> ok("""{"attempt":{"id":"t1","kind":"practice","title":"Chemistry","date":"2026-11-16T00:00:00Z","score":1,"total":1,"minutes":1,"mode":"tutor","seconds":40},"withdrawn":1,"items":[{"q":{"id":"CHE-0001","subject":"Chemistry","stem":"S","options":["a","b","c","d"],"answer":2},"chosen":2,"flagged":false,"bookmarked":true,"seconds":40,"stats":null}]}""")
                p.endsWith("/history") -> ok("""{"tests":[{"id":"t1","kind":"practice","title":"Chemistry","date":"2026-11-16","score":1,"total":1,"minutes":1}]}""")
                p.endsWith("/dashboard") -> ok("""{"bank":"mdcat","welcomed":true,"streakDays":3,"dailyGoal":50,"daily":[{"date":"2026-11-16","answered":10,"correct":7}],"bookmarks":2,"mistakesToRetry":4,"nextMock":"mini","resume":{"title":"Biology","done":3,"total":10,"href":"/test?id=abc-123"},"subjects":[{"subject":"Biology","chapters":[{"chapter":"Cell","answered":10,"available":50,"correct":7}]}],"weakTopics":[],"recent":[]}""")
                p.endsWith("/mistakes") -> ok("""{"mistakes":[{"q":{"id":"X","subject":"Biology","stem":"S","options":["a","b","c","d"],"answer":1},"chosen":0,"date":"2026-11-16","tries":2}]}""")
                p.endsWith("/bookmarks") -> ok("""{"bookmarks":[{"id":"X","subject":"Biology","stem":"S","options":["a","b","c","d"],"answer":1}]}""")
                p.endsWith("/bookmark") -> ok("""{"ok":true,"on":true}""")
                p.endsWith("/report") -> ok("""{"ok":true}""")
                else -> err(404, "not_found")
            }
        }
        val cat = a.catalog("nums")
        assertEquals(10, cat.chapters.single().open)
        assertTrue(seen.last().path.contains("bank=nums"))
        val pool = a.pool("mdcat", listOf("Biology", "Chemistry"), listOf("Cell"))
        assertTrue(seen.last().path.contains("subjects=Biology%7CChemistry"))
        assertEquals(41, pool.match(setOf(Filter.Unused, Filter.Marked)))
        assertEquals(50, pool.match(emptySet()))
        val start = a.start(StartRequest(kind = "practice", bank = "mdcat", subjects = listOf("Chemistry"), filters = listOf("unused"), tutor = true, timed = false, count = 10))
        assertTrue(start.short)
        val sent = seen.last().body!!
        assertEquals("practice", sent["kind"]!!.jsonPrimitive.content)
        assertNull(sent["mock"]) // nulls are left out
        assertEquals("CHE-0001", (a.attempt("t1") as AttemptResult.Open).sitting.items.single().q.id)
        assertEquals(AttemptResult.Finished("done"), a.attempt("done"))
        val checked = a.check("t1", 0, 2, 40)
        assertEquals("no", checked.reveal.wrongFor(0))
        assertEquals(10, checked.stats!!.picks[2])
        a.answer("t1", 0, null, true, 12)
        assertTrue(seen.last().body!!.containsKey("answer")) // a blank answer is sent as null
        assertFalse(a.finish("t1").empty)
        val review = a.review("t1")
        assertEquals(1, review.withdrawn)
        assertEquals("tutor", review.attempt.mode)
        assertEquals(1, a.history().size)
        val d = a.dashboard()
        assertEquals("abc-123", d.resume!!.attemptId)
        assertEquals(10, d.subjects.single().answered)
        assertEquals(2, a.mistakes().single().tries)
        assertEquals(1, a.bookmarks().single().answer)
        assertTrue(a.bookmark("X", true))
        a.report("X", "The answer key is wrong", "")
    }

    @Test fun offlineEndpoints() = runTest {
        val a = api { req ->
            val p = req.url.encodedPath
            when {
                p.endsWith("/pack") -> ok("""{"pack":{"id":"p1","title":"Chemistry","expiresAt":99,"items":[{"id":"X","subject":"Chemistry","stem":"S","options":["a","b","c","d"],"answer":3}]},"held":100,"cap":300,"now":5}""")
                p.endsWith("/renew") -> ok("""{"packs":[{"id":"p1","expiresAt":199}],"held":100,"cap":300,"now":6}""")
                p.endsWith("/release") -> ok("""{"ok":true}""")
                p.endsWith("/sync") -> ok("""{"accepted":["s1"]}""")
                else -> err(404, "not_found")
            }
        }
        val pack = a.pack("k", null, "mdcat", listOf("Chemistry"), emptyList(), 100)
        assertEquals(3, pack.pack.items.single().answer)
        assertEquals(100, seen.last().body!!["count"]!!.jsonPrimitive.int)
        assertEquals(199L, a.renewPacks("k").packs.single().expiresAt)
        a.releasePack("k", "p1")
        assertEquals(listOf("s1"), a.sync("k", listOf(com.markhorprep.core.model.SyncSession("s1", "p1", 1, 2, listOf(com.markhorprep.core.model.SyncAnswer("X", 3, 10, 2))))))
    }

    @Test fun errorTable() = runTest {
        val cases = listOf(
            Triple(429, "rate_limited", ""","retry_after":30"""),
            Triple(429, "daily_limit", ""),
            Triple(402, "needs_pass", ""),
            Triple(409, "open_test", ""","attempt":"t9""""),
            Triple(409, "time_up", ""","attempt":"t9""""),
            Triple(409, "finished", ""),
            Triple(409, "empty", ""),
            Triple(409, "not_ready", ""),
        )
        for ((status, code, extra) in cases) {
            val a = api { err(status, code, "Shown to the student", extra) }
            try { a.catalog("mdcat"); fail("expected $code") } catch (e: ApiError) {
                assertEquals(status, e.status)
                assertEquals(code, e.code)
                assertEquals("Shown to the student", e.message)
                if (code == "rate_limited") assertEquals(30, e.extra["retry_after"]!!.jsonPrimitive.int)
                if (code == "open_test") assertEquals("t9", e.extra["attempt"]!!.jsonPrimitive.content)
            }
        }
    }

    @Test fun appWideEvents() = runTest {
        for ((status, code, event) in listOf(
            Triple(401, "signed_out", SessionEvent.SignedOut),
            Triple(423, "device_locked", SessionEvent.Locked),
            Triple(426, "update_required", SessionEvent.UpdateRequired),
            Triple(403, "integrity_failed", SessionEvent.IntegrityFailed("No")),
        )) {
            val tokens = MemoryTokenStore("abcdefghijklmnopqrstuvwxyz")
            val a = api(tokens) { err(status, code, "No") }
            val got = async { a.events.first() }
            kotlinx.coroutines.yield()
            runCatching { a.dashboard() }
            assertEquals(event, got.await())
            if (code == "signed_out") assertNull(tokens.token())
        }
    }

    @Test fun networkFailureIsOffline() = runTest {
        val a = api { throw java.io.IOException("no route") }
        try { a.me(); fail() } catch (e: ApiError) {
            assertTrue(e.isOffline)
            assertEquals(ApiError.OFFLINE_MESSAGE, e.message)
        }
    }
}
