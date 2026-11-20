package com.markhorprep.app.ui.more

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import kotlinx.coroutines.launch
import com.markhorprep.app.AppContainer
import com.markhorprep.app.ui.R
import com.markhorprep.app.ui.components.Divider
import com.markhorprep.app.ui.components.Field
import com.markhorprep.app.ui.components.Note
import com.markhorprep.app.ui.components.Panel
import com.markhorprep.app.ui.components.PillButton
import com.markhorprep.app.ui.components.RowItem
import com.markhorprep.app.ui.components.TopBar
import com.markhorprep.app.ui.components.shortDate
import com.markhorprep.app.ui.reset
import com.markhorprep.app.ui.theme.Ex
import com.markhorprep.core.api.ApiError
import com.markhorprep.core.model.User

/* The same names as the website (lib/format.ts planNames). */
fun planName(u: User): String = when {
    u.role != "student" -> "Staff"
    u.plan == "free" -> "Free plan"
    u.plan == "monthly" -> "One-month pass"
    u.plan == "season" -> "MDCAT Season Pass"
    u.plan == "bundle" -> "MDCAT + NUMS Bundle"
    else -> u.plan.replaceFirstChar { it.uppercase() }
}

@Composable
fun MoreScreen(container: AppContainer, nav: NavHostController) {
    val user by container.account.user.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val support = container.config.config.value?.support
    val site = support?.site ?: "https://markhorprep.com"
    val offlineOn = container.config.config.value?.offline?.enabled == true && user?.isFree == false
    var askSignOut by remember { mutableStateOf(false) }
    var unsent by remember { mutableIntStateOf(0) }
    val c = Ex.c

    fun open(url: String) { runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) } }

    Column(Modifier.fillMaxSize()) {
        TopBar("More")
        Column(Modifier.verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            user?.let { u ->
                Panel {
                    Text(u.name, style = MaterialTheme.typography.titleLarge, color = c.ink)
                    Text(listOfNotNull(u.email, u.phone).joinToString(" · "), style = MaterialTheme.typography.bodySmall, color = c.muted)
                    Text(planName(u) + (u.planExpiresAt?.let { " · until ${shortDate(it)}" } ?: ""), style = MaterialTheme.typography.bodyMedium, color = c.ink)
                }
            }
            Panel(padding = 0.dp) {
                RowItem("Edit name", onClick = { nav.navigate(R.EDIT_NAME) })
                Divider(); RowItem("Devices", onClick = { nav.navigate(R.DEVICES) })
                Divider(); RowItem("History", onClick = { nav.navigate(R.HISTORY) })
                Divider(); RowItem("Mistakes", onClick = { nav.navigate(R.MISTAKES) })
                Divider(); RowItem("Saved questions", onClick = { nav.navigate(R.BOOKMARKS) })
                if (offlineOn) { Divider(); RowItem("Downloads", onClick = { nav.navigate(R.DOWNLOADS) }) }
            }
            Panel(padding = 0.dp) {
                support?.whatsapp?.takeIf { w -> w.any(Char::isDigit) }?.let { w -> RowItem("Help on WhatsApp", onClick = { open("https://wa.me/${w.filter(Char::isDigit)}") }) ; Divider() }
                support?.email?.takeIf { it.isNotBlank() }?.let { e -> RowItem("Email us", e, onClick = { open("mailto:$e") }); Divider() }
                RowItem("Privacy policy", onClick = { open("$site/privacy") })
                Divider(); RowItem("Terms", onClick = { open("$site/terms") })
            }
            Panel(padding = 0.dp) {
                RowItem("Sign out", onClick = {
                    scope.launch { unsent = runCatching { container.offline.unsyncedCount() }.getOrDefault(0); askSignOut = true }
                })
                if (user?.isStudent != false) { Divider(); RowItem("Delete account", onClick = { nav.navigate(R.DELETE) }) }
            }
        }
    }

    if (askSignOut) AlertDialog(
        onDismissRequest = { askSignOut = false },
        title = { Text("Sign out?") },
        text = { Text(if (unsent > 0) "Some offline answers haven't been sent yet. They'll be sent when you sign in again." else "You can sign in again any time.") },
        confirmButton = {
            TextButton({
                askSignOut = false
                scope.launch {
                    // Try to send offline answers first.
                    runCatching { container.offline.sync() }
                    container.account.signOut()
                    container.forgetAccount()
                    nav.reset(R.SIGNIN)
                }
            }) { Text("Sign out") }
        },
        dismissButton = { TextButton({ askSignOut = false }) { Text("Cancel") } },
    )
}

@Composable
fun EditNameScreen(container: AppContainer, nav: NavHostController) {
    val user by container.account.user.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()
    var name by remember { mutableStateOf(user?.name.orEmpty()) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    Column(Modifier.fillMaxSize()) {
        TopBar("Edit name", onBack = { nav.popBackStack() })
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Field(name, { name = it.take(80) }, "Your name")
            error?.let { Note(it, "bad") }
            PillButton("Save", busy = busy, enabled = name.isNotBlank(), modifier = Modifier.fillMaxWidth(), onClick = {
                busy = true; error = null
                scope.launch {
                    try { container.account.rename(name); nav.popBackStack() } catch (e: ApiError) { error = e.message } finally { busy = false }
                }
            })
        }
    }
}

@Composable
fun DeleteAccountScreen(container: AppContainer, nav: NavHostController) {
    val user by container.account.user.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()
    var password by remember { mutableStateOf("") }
    var sure by remember { mutableStateOf(false) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val hasPassword = user?.methods?.contains("email") == true
    val c = Ex.c
    LaunchedEffect(Unit) { runCatching { container.account.refresh() } }
    Column(Modifier.fillMaxSize()) {
        TopBar("Delete account", onBack = { nav.popBackStack() })
        Column(Modifier.verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text(
                "This deletes your account and everything in it: your answers, tests, progress, saved questions and devices. It can't be undone.",
                style = MaterialTheme.typography.bodyLarge, color = c.ink,
            )
            if (hasPassword) Field(password, { password = it }, "Your password", password = true)
            androidx.compose.foundation.layout.Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(sure, { sure = it }, colors = CheckboxDefaults.colors(checkedColor = c.bad))
                Text("I understand this can't be undone", style = MaterialTheme.typography.bodyMedium, color = c.ink)
            }
            error?.let { Note(it, "bad") }
            PillButton("Delete my account", busy = busy, enabled = sure && (!hasPassword || password.isNotEmpty()), modifier = Modifier.fillMaxWidth(), onClick = {
                busy = true; error = null
                scope.launch {
                    try {
                        container.account.deleteAccount(if (hasPassword) password else null)
                        container.offline.wipeAll()
                        container.forgetAccount()
                        nav.reset(R.SIGNIN)
                    } catch (e: ApiError) {
                        if (e.code == "reauth_required") {
                            container.account.signOut()
                            container.forgetAccount()
                            nav.reset(R.SIGNIN)
                        } else error = e.message
                    } finally { busy = false }
                }
            })
        }
    }
}
