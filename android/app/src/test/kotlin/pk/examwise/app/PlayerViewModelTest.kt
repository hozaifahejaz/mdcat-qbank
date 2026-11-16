package pk.examwise.app

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
import pk.examwise.app.ui.player.Done
import pk.examwise.app.ui.player.PItem
import pk.examwise.app.ui.player.PlayerSource
import pk.examwise.app.ui.player.PlayerViewModel
import pk.examwise.core.api.ApiError
import pk.examwise.core.model.CheckAnswerResult

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
