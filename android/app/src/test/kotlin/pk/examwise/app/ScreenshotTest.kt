package pk.examwise.app

import android.app.Application
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onRoot
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import pk.examwise.app.ui.Load
import pk.examwise.app.ui.auth.AuthPage
import pk.examwise.app.ui.components.Field
import pk.examwise.app.ui.components.PillButton
import pk.examwise.app.ui.components.TopBar
import pk.examwise.app.ui.home.HomeContent
import pk.examwise.app.ui.home.HomeData
import pk.examwise.app.ui.mocks.MocksContent
import pk.examwise.app.ui.mocks.MocksData
import pk.examwise.app.ui.player.PItem
import pk.examwise.app.ui.player.PlayerBody
import pk.examwise.app.ui.player.PlayerState
import pk.examwise.app.ui.practice.PracticeContent
import pk.examwise.app.ui.practice.PracticeState
import pk.examwise.app.ui.practice.Selection
import pk.examwise.app.ui.progress.ProgressContent
import pk.examwise.app.ui.review.RItem
import pk.examwise.app.ui.review.ReviewContent
import pk.examwise.app.ui.review.ReviewData
import pk.examwise.app.ui.theme.Ex
import pk.examwise.app.ui.theme.ExamwiseTheme
import pk.examwise.app.ui.watermark.WatermarkLayer
import pk.examwise.core.model.Filter

/* Screens drawn on the JVM with sample data, in light and dark, at a small phone width. The images are kept as a
   CI artifact (app/build/outputs/roborazzi). */
@RunWith(AndroidJUnit4::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [35], application = Application::class, qualifiers = "w360dp-h780dp-xxhdpi")
open class ScreenshotTest {
    @get:Rule val compose = createComposeRule()

    open val width = "360"

    private fun shot(name: String, content: @Composable () -> Unit) {
        var dark by mutableStateOf(false)
        compose.setContent {
            ExamwiseTheme(dark = dark) {
                Box(Modifier.fillMaxSize().background(Ex.c.bg)) { content() }
            }
        }
        compose.onRoot().captureRoboImage("build/outputs/roborazzi/${name}_${width}_light.png")
        dark = true
        compose.waitForIdle()
        compose.onRoot().captureRoboImage("build/outputs/roborazzi/${name}_${width}_dark.png")
    }

    @Test fun signIn() = shot("signin") {
        AuthPage("Sign in", "Welcome back. Pick up where you left off.") {
            Field("student@example.pk", {}, "Email")
            Field("password", {}, "Password", password = true)
            PillButton("Sign in", {})
            PillButton("Continue with Google", {}, dark = false)
        }
    }

    @Test fun home() = shot("home") {
        Column { TopBar("Home"); HomeContent(Load(HomeData(Samples.banks, Samples.dashboard), loading = false), true, {}, {}, {}, {}, {}) }
    }

    @Test fun homeOffline() = shot("home_offline") {
        Column { TopBar("Home"); HomeContent(Load(HomeData(Samples.banks, Samples.dashboard), loading = false, offline = true), true, {}, {}, {}, {}, {}) }
    }

    @Test fun practice() = shot("practice") {
        Column {
            TopBar("Create a test")
            PracticeContent(
                PracticeState(Samples.banks, "mdcat", Samples.catalog, Selection.Chapters("Biology", setOf("Cell structure")), filters = setOf(Filter.Unused), pool = Samples.pool, loading = false),
                {}, {}, {}, {}, {}, {}, {}, {}, {},
            )
        }
    }

    @Test fun playerTutorAnswered() = shot("player_tutor") {
        val q = Samples.question
        PlayerBody(
            PlayerState(
                loading = false, title = "Practice · Chemistry", mode = "tutor",
                items = listOf(PItem(0, q.asked(), answer = 1, checked = true, seconds = 48, reveal = q, stats = Samples.stats), PItem(1, q.asked().copy(id = "2"))),
            ),
            0, { null }, {}, {}, null,
        )
        WatermarkLayer("3f2a9c1b-0000-4000-8000-000000000000")
    }

    @Test fun playerTimed() = shot("player_timed") {
        val q = Samples.question
        PlayerBody(
            PlayerState(
                loading = false, title = "Full mock 1", mode = "mock",
                items = listOf(PItem(0, q.asked(), answer = 3, flagged = true), PItem(1, q.asked().copy(id = "2"))),
                crossed = mapOf(0 to setOf(1)),
            ),
            1, { 5400 }, {}, {}, null,
        )
    }

    @Test fun review() = shot("review") {
        ReviewContent(ReviewData("Chemistry", 7, 10, 540, 1, listOf(RItem(Samples.question, 1, seconds = 48, stats = Samples.stats))), 0)
    }

    @Test fun mocksFree() = shot("mocks") {
        Column { TopBar("Mocks"); MocksContent(MocksData(Samples.catalog, Samples.history), null, null, false, null, { _, _ -> }, {}, {}) }
    }

    @Test fun progress() = shot("progress") {
        Column { TopBar("Progress"); ProgressContent(Samples.dashboard) {} }
    }
}

@Config(sdk = [35], application = Application::class, qualifiers = "w412dp-h915dp-xxhdpi")
class ScreenshotWideTest : ScreenshotTest() {
    override val width = "412"
}
