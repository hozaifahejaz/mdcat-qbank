package com.markhorprep.app

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import com.markhorprep.app.ui.player.Done
import com.markhorprep.app.ui.player.PItem
import com.markhorprep.app.ui.player.PlayerSource
import com.markhorprep.app.ui.player.PlayerViewModel
import com.markhorprep.core.api.ApiError
import com.markhorprep.core.model.CheckAnswerResult
import com.markhorprep.core.model.Peek
import kotlinx.coroutines.CompletableDeferred

@OptIn(ExperimentalCoroutinesApi::class)
class PlayerViewModelTest {
    private val dispatcher = StandardTestDispatcher()

    @Before fun setUp() = Dispatchers.setMain(dispatcher)
    @After fun tearDown() = Dispatchers.resetMain()

    private class Fake(val mode: String, val deadline: Long? = null) : PlayerSource {
        override val offline = false
        val saved = mutableListOf<PItem>()
        var finished = 0
        var failFinish: ApiError? = null
        override suspend fun load() = PlayerSource.Loaded("Chemistry", mode, (0 until 3).map { PItem(it, Samples.question.asked().copy(id = "Q$it")) }, deadline, 1_000_000)
        override suspend fun check(item: PItem, answer: Int, seconds: Int) = CheckAnswerResult(2, Samples.question, Samples.stats)
        override suspend fun save(item: PItem) { saved += item }
        override suspend fun bookmark(questionId: String, on: Boolean) = Unit
        override suspend fun report(questionId: String, reason: String, details: String) = Unit
        override suspend fun finish(): Done { failFinish?.let { throw it }; finished++; return Done.Review("t1") }
    }

    @Test fun tutorPicksThenSubmitsAndLocks() = runTest(dispatcher) {
        var t = 1_000_000L
        val vm = PlayerViewModel(Fake("tutor")) { t }
        runCurrent()
        vm.choose(1)
        assertEquals(1, vm.state.value.current!!.picked)
        assertNull(vm.state.value.current!!.answer)
        t += 42_000
        vm.check()
        runCurrent()
        val cur = vm.state.value.current!!
        assertTrue(cur.checked)
        assertEquals(2, cur.answer)
        assertEquals(42, cur.seconds)
        vm.choose(0) // locked once checked
        assertNull(vm.state.value.current!!.picked)
    }

    /* Practice reads the key ahead, so Submit shows the result before the server has locked the answer in. */
    private class Ahead : PlayerSource {
        override val offline = false
        val peeked = mutableListOf<Int>()
        val lock = CompletableDeferred<Int>()
        var fullChecks = 0
        override suspend fun load() = PlayerSource.Loaded("Chemistry", "tutor", (0 until 3).map { PItem(it, Samples.question.asked().copy(id = "Q$it")) }, null, 1_000_000)
        override suspend fun peek(item: PItem): Peek { peeked += item.idx; return Peek(Samples.question, Samples.stats) }
        override suspend fun checkQuiet(item: PItem, answer: Int, seconds: Int) = lock.await()
        override suspend fun check(item: PItem, answer: Int, seconds: Int): CheckAnswerResult { fullChecks++; return CheckAnswerResult(answer, Samples.question) }
        override suspend fun save(item: PItem) = Unit
        override suspend fun bookmark(questionId: String, on: Boolean) = Unit
        override suspend fun report(questionId: String, reason: String, details: String) = Unit
        override suspend fun finish(): Done = Done.Review("t1")
    }

    @Test fun practiceShowsTheResultAtOnce() = runTest(dispatcher) {
        val fake = Ahead()
        val vm = PlayerViewModel(fake) { 1_000_000 }
        runCurrent()
        assertEquals(listOf(0, 1), fake.peeked)
        vm.choose(1)
        vm.check()
        // Still waiting on the server, but the explanation is up.
        val cur = vm.state.value.current!!
        assertTrue(cur.checked)
        assertEquals(1, cur.answer)
        assertEquals(Samples.question, cur.reveal)
        assertEquals(0, fake.fullChecks)
        fake.lock.complete(1)
        runCurrent()
        assertTrue(vm.state.value.current!!.checked)
    }

    @Test fun practiceUnlocksAgainWhenTheSaveFails() = runTest(dispatcher) {
        val fake = Ahead()
        val vm = PlayerViewModel(fake) { 1_000_000 }
        runCurrent()
        vm.choose(2)
        vm.check()
        fake.lock.completeExceptionally(ApiError(409, "not_saved", "That answer didn't save. Please try again."))
        runCurrent()
        val cur = vm.state.value.current!!
        assertTrue(!cur.checked)
        assertNull(cur.reveal)
        assertEquals(2, cur.picked)
        assertEquals("That answer didn't save. Please try again.", vm.state.value.message)
    }

    @Test fun timedSavesEveryAnswerAndSubmits() = runTest(dispatcher) {
        val fake = Fake("timed")
        val vm = PlayerViewModel(fake) { 1_000_000 }
        runCurrent()
        vm.choose(3)
        vm.next()
        vm.flag()
        runCurrent()
        assertEquals(listOf(3, null), fake.saved.map { it.answer })
        assertTrue(fake.saved.last().flagged)
        assertEquals(1, vm.state.value.answeredCount)
        vm.submit()
        runCurrent()
        assertEquals(Done.Review("t1"), vm.state.value.done)
    }

    @Test fun submitWithoutConnectionSaysSo() = runTest(dispatcher) {
        val fake = Fake("timed").apply { failFinish = ApiError(0, "offline", "Connect to the internet, then submit again.") }
        val vm = PlayerViewModel(fake) { 1_000_000 }
        runCurrent()
        vm.submit()
        runCurrent()
        assertNull(vm.state.value.done)
        assertEquals("Connect to the internet, then submit again.", vm.state.value.message)
    }

    @Test fun clockUsesServerTime() = runTest(dispatcher) {
        // The phone's clock is 10 minutes behind the server's; 30 minutes are left by the server.
        val vm = PlayerViewModel(Fake("timed", deadline = 1_000_000 + 30 * 60_000)) { 1_000_000 - 10 * 60_000 }
        runCurrent()
        assertEquals(30 * 60L, vm.secondsLeft())
        vm.submit() // stops the clock
        runCurrent()
    }
}
