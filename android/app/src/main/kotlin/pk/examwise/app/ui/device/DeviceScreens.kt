package pk.examwise.app.ui.device

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import kotlinx.coroutines.launch
import pk.examwise.app.AppContainer
import pk.examwise.app.ui.R
import pk.examwise.app.ui.components.Divider
import pk.examwise.app.ui.components.ErrorState
import pk.examwise.app.ui.components.LinkButton
import pk.examwise.app.ui.components.Loading
import pk.examwise.app.ui.components.Note
import pk.examwise.app.ui.components.Panel
import pk.examwise.app.ui.components.PillButton
import pk.examwise.app.ui.components.RowItem
import pk.examwise.app.ui.components.TopBar
import pk.examwise.app.ui.components.shortDate
import pk.examwise.app.ui.reset
import pk.examwise.app.ui.start.Logo
import pk.examwise.app.ui.theme.Ex
import pk.examwise.core.api.ApiError
import pk.examwise.core.model.ClaimResult
import pk.examwise.core.model.Device
import pk.examwise.core.model.RemoveResult

private suspend fun signOutTo(container: AppContainer, nav: NavHostController) {
    container.account.signOut()
    container.forgetAccount()
    nav.reset(R.SIGNIN)
}

/* Claims this phone. Active goes Home; the other answers have their own screens. Offline goes Home on the cached
   account, where downloads still work. */
@Composable
fun GateScreen(container: AppContainer, nav: NavHostController) {
    var error by remember { mutableStateOf<String?>(null) }
    var waitUntil by remember { mutableStateOf<String?>(null) }
    var attempt by remember { mutableIntStateOf(0) }
    val scope = rememberCoroutineScope()
    LaunchedEffect(attempt) {
        error = null
        try {
            when (val r = container.account.claim()) {
                ClaimResult.Active -> nav.reset(R.HOME)
                is ClaimResult.DeviceLimit -> nav.reset(R.DEVICE_LIMIT)
                is ClaimResult.TakeoverLimit -> waitUntil = r.nextAllowedAt
            }
        } catch (e: ApiError) {
            when {
                e.isOffline && container.account.user.value != null -> nav.reset(R.HOME)
                e.status in setOf(401, 423, 426) || e.code == "integrity_failed" -> Unit
                else -> error = e.message
            }
        }
    }
    when {
        waitUntil != null -> Message(
            "You've switched devices too often today",
            "You can switch to this phone again on ${shortDate(waitUntil)}. Until then, keep using your other device.",
        ) { PillButton("Sign out", { scope.launch { signOutTo(container, nav) } }, dark = false, modifier = Modifier.fillMaxWidth()) }
        error != null -> ErrorState(error!!, onRetry = { attempt++ })
        else -> Loading()
    }
}

@Composable
private fun Message(title: String, text: String, actions: @Composable () -> Unit) {
    val c = Ex.c
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(28.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Logo(48)
        Spacer(Modifier.height(20.dp))
        Text(title, style = MaterialTheme.typography.headlineSmall, color = c.ink, textAlign = TextAlign.Center)
        Spacer(Modifier.height(8.dp))
        Text(text, style = MaterialTheme.typography.bodyLarge, color = c.muted, textAlign = TextAlign.Center)
        Spacer(Modifier.height(24.dp))
        Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(10.dp)) { actions() }
    }
}

private fun deviceLine(d: Device): String = buildString {
    append(if (d.active) "In use now" else "Last used ${shortDate(java.time.Instant.ofEpochMilli(d.lastSeenAt).toString())}")
}

/* Two devices already registered: remove one to use this phone. */
@Composable
fun DeviceLimitScreen(container: AppContainer, nav: NavHostController) {
    val scope = rememberCoroutineScope()
    var devices by remember { mutableStateOf<List<Device>?>(null) }
    var note by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(Unit) {
        try {
            when (val r = container.account.claim()) {
                ClaimResult.Active -> nav.reset(R.HOME)
                is ClaimResult.DeviceLimit -> devices = r.devices
                is ClaimResult.TakeoverLimit -> nav.reset(R.GATE)
            }
        } catch (e: ApiError) { note = e.message; devices = emptyList() }
    }
    val c = Ex.c
    val list = devices ?: run { Loading(); return }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Spacer(Modifier.height(12.dp))
        Text("You're signed in on two devices", style = MaterialTheme.typography.headlineSmall, color = c.ink)
        Text("Remove one to use Examwise on this phone.", style = MaterialTheme.typography.bodyLarge, color = c.muted)
        note?.let { Note(it, "warn") }
        Panel(padding = 0.dp) {
            list.forEachIndexed { i, d ->
                if (i > 0) Divider()
                RowItem(d.label, deviceLine(d)) {
                    LinkButton(if (busy == d.id) "Removing…" else "Remove", {
                        busy = d.id
                        scope.launch {
                            try {
                                when (val r = container.account.removeDevice(d.id)) {
                                    is RemoveResult.Removed -> {
                                        when (container.account.claim()) {
                                            ClaimResult.Active -> nav.reset(R.HOME)
                                            else -> devices = r.devices
                                        }
                                    }
                                    is RemoveResult.SwapLimit -> note = "You can remove a device again on ${shortDate(r.nextAllowedAt)}."
                                    RemoveResult.NotFound -> devices = list.filter { it.id != d.id }
                                }
                            } catch (e: ApiError) { note = e.message } finally { busy = null }
                        }
                    }, color = c.bad)
                }
            }
        }
        LinkButton("Sign out", { scope.launch { signOutTo(container, nav) } }, color = c.muted)
    }
}

/* The account is in use on another device. */
@Composable
fun LockedScreen(container: AppContainer, nav: NavHostController) {
    val scope = rememberCoroutineScope()
    var label by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf(false) }
    var note by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(Unit) {
        runCatching { container.account.check() }.getOrNull()?.let {
            if (it is pk.examwise.core.model.CheckResult.Locked) label = it.activeLabel
            else if (it == pk.examwise.core.model.CheckResult.Active) nav.reset(R.HOME)
        }
    }
    Message(
        "Your account is active on ${label ?: "another device"}",
        "Use it here instead, and the other device will stop.",
    ) {
        note?.let { Note(it, "warn") }
        PillButton("Use it here", busy = busy, modifier = Modifier.fillMaxWidth(), onClick = {
            busy = true; note = null
            scope.launch {
                try {
                    when (val r = container.account.claim()) {
                        ClaimResult.Active -> nav.reset(R.HOME)
                        is ClaimResult.DeviceLimit -> nav.reset(R.DEVICE_LIMIT)
                        is ClaimResult.TakeoverLimit -> note = "You've switched devices too often today. You can switch again on ${shortDate(r.nextAllowedAt)}."
                    }
                } catch (e: ApiError) { note = e.message } finally { busy = false }
            }
        })
        PillButton("Sign out", { scope.launch { signOutTo(container, nav) } }, dark = false, modifier = Modifier.fillMaxWidth())
    }
}

/* The account's registered devices, with the active one marked. */
@Composable
fun DevicesScreen(container: AppContainer, nav: NavHostController) {
    val scope = rememberCoroutineScope()
    var devices by remember { mutableStateOf<List<Device>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var note by remember { mutableStateOf<String?>(null) }
    var attempt by remember { mutableIntStateOf(0) }
    LaunchedEffect(attempt) {
        error = null
        try { devices = container.account.devices() } catch (e: ApiError) { error = e.message }
    }
    val c = Ex.c
    Column(Modifier.fillMaxSize()) {
        TopBar("Devices", onBack = { nav.popBackStack() })
        when {
            error != null -> ErrorState(error!!, onRetry = { attempt++ })
            devices == null -> Loading()
            else -> Column(Modifier.verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                note?.let { Note(it, "warn") }
                Panel(padding = 0.dp) {
                    devices!!.forEachIndexed { i, d ->
                        if (i > 0) Divider()
                        RowItem(d.label, deviceLine(d)) {
                            if (!d.active) LinkButton("Remove", {
                                scope.launch {
                                    try {
                                        when (val r = container.account.removeDevice(d.id)) {
                                            is RemoveResult.Removed -> devices = r.devices
                                            is RemoveResult.SwapLimit -> note = "You can remove a device again on ${shortDate(r.nextAllowedAt)}."
                                            RemoveResult.NotFound -> attempt++
                                        }
                                    } catch (e: ApiError) { note = e.message }
                                }
                            }, color = c.bad)
                        }
                    }
                }
            }
        }
    }
}
