package pk.examwise.app.ui

import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.PlaylistAddCheck
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import pk.examwise.app.AppContainer
import pk.examwise.app.ui.auth.ForgotScreen
import pk.examwise.app.ui.auth.PhoneScreen
import pk.examwise.app.ui.auth.SignInScreen
import pk.examwise.app.ui.auth.SignUpScreen
import pk.examwise.app.ui.device.DeviceLimitScreen
import pk.examwise.app.ui.device.DevicesScreen
import pk.examwise.app.ui.device.GateScreen
import pk.examwise.app.ui.device.LockedScreen
import pk.examwise.app.ui.home.HomeScreen
import pk.examwise.app.ui.mocks.MocksScreen
import pk.examwise.app.ui.more.DeleteAccountScreen
import pk.examwise.app.ui.more.EditNameScreen
import pk.examwise.app.ui.more.MoreScreen
import pk.examwise.app.ui.offline.DownloadsScreen
import pk.examwise.app.ui.player.OfflinePlayerScreen
import pk.examwise.app.ui.player.PlayerScreen
import pk.examwise.app.ui.practice.PracticeScreen
import pk.examwise.app.ui.progress.BookmarksScreen
import pk.examwise.app.ui.progress.HistoryScreen
import pk.examwise.app.ui.progress.MistakesScreen
import pk.examwise.app.ui.progress.ProgressScreen
import pk.examwise.app.ui.review.LocalReviewScreen
import pk.examwise.app.ui.review.ReviewScreen
import pk.examwise.app.ui.start.BlockedScreen
import pk.examwise.app.ui.start.SplashScreen
import pk.examwise.app.ui.start.UpdateScreen
import pk.examwise.app.ui.theme.Ex
import pk.examwise.app.ui.theme.ExamwiseTheme
import pk.examwise.app.work.SyncWorker
import pk.examwise.core.api.SessionEvent
import pk.examwise.core.model.CheckResult

object R {
    const val SPLASH = "splash"
    const val UPDATE = "update"
    const val BLOCKED = "blocked?msg={msg}"
    const val SIGNIN = "signin"
    const val SIGNUP = "signup"
    const val PHONE = "phone"
    const val FORGOT = "forgot"
    const val GATE = "gate"
    const val DEVICE_LIMIT = "device-limit"
    const val LOCKED = "locked"
    const val HOME = "home"
    const val PRACTICE = "practice?bank={bank}"
    const val MOCKS = "mocks"
    const val PROGRESS = "progress"
    const val MORE = "more"
    const val PLAYER = "player/{id}"
    const val REVIEW = "review/{id}"
    const val HISTORY = "history"
    const val MISTAKES = "mistakes"
    const val BOOKMARKS = "bookmarks"
    const val DEVICES = "devices"
    const val EDIT_NAME = "edit-name"
    const val DELETE = "delete-account"
    const val DOWNLOADS = "downloads"
    const val OFFLINE_PLAYER = "offline-player/{pack}"
    const val LOCAL_REVIEW = "local-review/{session}"

    fun practice(bank: String? = null) = if (bank == null) "practice" else "practice?bank=${Uri.encode(bank)}"
    fun player(id: String) = "player/${Uri.encode(id)}"
    fun review(id: String) = "review/${Uri.encode(id)}"
    fun blocked(msg: String) = "blocked?msg=${Uri.encode(msg)}"
    fun offlinePlayer(pack: String) = "offline-player/${Uri.encode(pack)}"
    fun localReview(session: String) = "local-review/${Uri.encode(session)}"

    val tabs = listOf(HOME, PRACTICE, MOCKS, PROGRESS, MORE)
    /* Screens a lock or sign-out shouldn't stack on top of. */
    val outside = setOf(SPLASH, UPDATE, BLOCKED, SIGNIN, SIGNUP, PHONE, FORGOT, GATE, DEVICE_LIMIT, LOCKED)
}

private data class Tab(val route: String, val label: String, val icon: ImageVector, val go: String)

private val tabs = listOf(
    Tab(R.HOME, "Home", Icons.Filled.Home, R.HOME),
    Tab(R.PRACTICE, "Practice", Icons.Filled.PlaylistAddCheck, R.practice()),
    Tab(R.MOCKS, "Mocks", Icons.Filled.Timer, R.MOCKS),
    Tab(R.PROGRESS, "Progress", Icons.Filled.BarChart, R.PROGRESS),
    Tab(R.MORE, "More", Icons.Filled.Menu, R.MORE),
)

/* Clears everything and opens [route]. */
fun NavHostController.reset(route: String) = navigate(route) { popUpTo(0) { inclusive = true }; launchSingleTop = true }

@Composable
fun ExamwiseRoot(container: AppContainer) {
    ExamwiseTheme {
        val nav = rememberNavController()
        val entry by nav.currentBackStackEntryAsState()
        val route = entry?.destination?.route

        // Answers from anywhere that move the student: signed out, locked by another device, app too old, refused phone.
        LaunchedEffect(Unit) {
            container.api.events.collect { e ->
                val here = nav.currentDestination?.route
                when (e) {
                    SessionEvent.SignedOut -> {
                        container.account.setUser(null)
                        container.forgetAccount()
                        if (here !in setOf(R.SIGNIN, R.SIGNUP, R.PHONE, R.FORGOT)) nav.reset(R.SIGNIN)
                    }
                    SessionEvent.Locked -> if (here != R.LOCKED) nav.navigate(R.LOCKED) { launchSingleTop = true }
                    SessionEvent.UpdateRequired -> nav.reset(R.UPDATE)
                    is SessionEvent.IntegrityFailed -> {
                        container.offline.wipePacks()
                        nav.reset(R.blocked(e.message))
                    }
                }
            }
        }

        // Coming to the front: check this phone is still the active device, renew offline packs, send what waits.
        val lifecycle = LocalLifecycleOwner.current.lifecycle
        LaunchedEffect(lifecycle) {
            lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
                if (nav.currentDestination?.route in R.outside || container.account.user.value == null) return@repeatOnLifecycle
                checkIn(container, nav)
                container.outbox.kick()
                SyncWorker.queue(container.app)
                if (container.account.user.value?.isFree == false && container.config.config.value?.offline?.enabled == true) {
                    runCatching { container.offline.renew() }
                }
            }
        }

        // During a test, check in every checkinSeconds.
        LaunchedEffect(route, lifecycle) {
            if (route != R.PLAYER) return@LaunchedEffect
            lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
                val every = (container.config.config.value?.checkinSeconds ?: 60).coerceAtLeast(15) * 1000L
                while (isActive) {
                    delay(every)
                    checkIn(container, nav)
                }
            }
        }

        val c = Ex.c
        val showTabs = route in R.tabs
        Column(Modifier.fillMaxSize().background(c.bg).windowInsetsPadding(WindowInsets.safeDrawing)) {
            Box(Modifier.weight(1f)) {
                NavHost(nav, startDestination = R.SPLASH) {
                    composable(R.SPLASH) { SplashScreen(container, nav) }
                    composable(R.UPDATE) { UpdateScreen() }
                    composable(R.BLOCKED, arguments = listOf(navArgument("msg") { type = NavType.StringType; defaultValue = "" })) {
                        BlockedScreen(it.arguments?.getString("msg").orEmpty(), container, nav)
                    }
                    composable(R.SIGNIN) { SignInScreen(container, nav) }
                    composable(R.SIGNUP) { SignUpScreen(container, nav) }
                    composable(R.PHONE) { PhoneScreen(container, nav) }
                    composable(R.FORGOT) { ForgotScreen(container, nav) }
                    composable(R.GATE) { GateScreen(container, nav) }
                    composable(R.DEVICE_LIMIT) { DeviceLimitScreen(container, nav) }
                    composable(R.LOCKED) { LockedScreen(container, nav) }
                    composable(R.HOME) { HomeScreen(container, nav) }
                    composable(R.PRACTICE, arguments = listOf(navArgument("bank") { type = NavType.StringType; nullable = true; defaultValue = null })) {
                        PracticeScreen(container, nav, it.arguments?.getString("bank"))
                    }
                    composable(R.MOCKS) { MocksScreen(container, nav) }
                    composable(R.PROGRESS) { ProgressScreen(container, nav) }
                    composable(R.MORE) { MoreScreen(container, nav) }
                    composable(R.PLAYER) { PlayerScreen(container, nav, it.arguments?.getString("id").orEmpty()) }
                    composable(R.REVIEW) { ReviewScreen(container, nav, it.arguments?.getString("id").orEmpty()) }
                    composable(R.HISTORY) { HistoryScreen(container, nav) }
                    composable(R.MISTAKES) { MistakesScreen(container, nav) }
                    composable(R.BOOKMARKS) { BookmarksScreen(container, nav) }
                    composable(R.DEVICES) { DevicesScreen(container, nav) }
                    composable(R.EDIT_NAME) { EditNameScreen(container, nav) }
                    composable(R.DELETE) { DeleteAccountScreen(container, nav) }
                    composable(R.DOWNLOADS) { DownloadsScreen(container, nav) }
                    composable(R.OFFLINE_PLAYER) { OfflinePlayerScreen(container, nav, it.arguments?.getString("pack").orEmpty()) }
                    composable(R.LOCAL_REVIEW) { LocalReviewScreen(container, nav, it.arguments?.getString("session").orEmpty()) }
                }
            }
            if (showTabs) {
                NavigationBar(containerColor = c.card, tonalElevation = 0.dp) {
                    tabs.forEach { t ->
                        NavigationBarItem(
                            selected = route == t.route,
                            onClick = { if (route != t.route) nav.navigate(t.go) { popUpTo(R.HOME) { saveState = false }; launchSingleTop = true } },
                            icon = { Icon(t.icon, contentDescription = null) },
                            label = { Text(t.label) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = c.ink, selectedTextColor = c.ink, indicatorColor = c.blueSoft,
                                unselectedIconColor = c.muted, unselectedTextColor = c.muted,
                            ),
                        )
                    }
                }
            }
        }
    }
}


/* device/check: locked shows the Locked screen; idle claims again without asking. */
private suspend fun checkIn(container: AppContainer, nav: NavHostController) {
    val r = runCatching { container.account.check() }.getOrNull() ?: return
    when (r) {
        is CheckResult.Locked -> if (nav.currentDestination?.route != R.LOCKED) nav.navigate(R.LOCKED) { launchSingleTop = true }
        CheckResult.Idle -> runCatching { container.account.claim() }
        CheckResult.Active -> Unit
    }
}
