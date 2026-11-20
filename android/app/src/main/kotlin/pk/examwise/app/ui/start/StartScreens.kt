package pk.examwise.app.ui.start

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import kotlinx.coroutines.launch
import pk.examwise.app.AppContainer
import pk.examwise.app.BuildConfig
import pk.examwise.app.ui.R
import pk.examwise.app.ui.components.ErrorState
import pk.examwise.app.ui.components.PillButton
import pk.examwise.app.ui.reset
import pk.examwise.app.ui.theme.Ex
import pk.examwise.core.api.ApiError

@Composable
fun Logo(size: Int = 56) {
    // The website's markhor, in the theme's blue (lighter in dark mode, as on the site). No tile behind it.
    Icon(painterResource(pk.examwise.app.R.drawable.ic_logo), contentDescription = null, tint = Ex.c.blue, modifier = Modifier.size(size.dp))
}

/* Start-up: app settings, then the stored session, then the device gate. Offline with a known account goes to Home,
   where downloads still work. */
@Composable
fun SplashScreen(container: AppContainer, nav: NavHostController) {
    var error by remember { mutableStateOf<String?>(null) }
    var attempt by remember { mutableIntStateOf(0) }
    LaunchedEffect(attempt) {
        error = null
        val config = container.config.load()
        if (config != null && BuildConfig.VERSION_CODE < config.minVersion) { nav.reset(R.UPDATE); return@LaunchedEffect }
        if (!container.account.hasSession()) { nav.reset(R.SIGNIN); return@LaunchedEffect }
        try {
            val user = container.account.refresh()
            if (user == null) { nav.reset(R.SIGNIN); return@LaunchedEffect }
            container.offline.claimFor(user.id)
            if (user.isFree) container.offline.wipePacks()
            nav.reset(R.GATE)
        } catch (e: ApiError) {
            if (e.status == 401 || e.status == 426 || e.status == 403) return@LaunchedEffect // handled by the app-wide events
            error = e.message
        }
    }
    val c = Ex.c
    if (error != null) ErrorState(error!!, onRetry = { attempt++ })
    else Box(Modifier.fillMaxSize().background(c.bg), contentAlignment = Alignment.Center) { Logo(64) }
}

@Composable
fun UpdateScreen() {
    val context = LocalContext.current
    val c = Ex.c
    Column(Modifier.fillMaxSize().padding(28.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Logo()
        Spacer(Modifier.height(24.dp))
        Text("Update Markhor Prep to continue", style = MaterialTheme.typography.headlineSmall, color = c.ink, textAlign = TextAlign.Center)
        Spacer(Modifier.height(8.dp))
        Text("This version no longer works. The new one is waiting on Google Play.", style = MaterialTheme.typography.bodyLarge, color = c.muted, textAlign = TextAlign.Center)
        Spacer(Modifier.height(24.dp))
        PillButton("Update", onClick = {
            val pkg = context.packageName.removeSuffix(".debug")
            val market = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$pkg"))
            runCatching { context.startActivity(market) }.onFailure {
                runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=$pkg"))) }
            }
        }, modifier = Modifier.fillMaxWidth())
    }
}

/* The server refused this phone. Its message is shown as is. */
@Composable
fun BlockedScreen(message: String, container: AppContainer, nav: NavHostController) {
    val scope = rememberCoroutineScope()
    val c = Ex.c
    Column(Modifier.fillMaxSize().padding(28.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Logo()
        Spacer(Modifier.height(24.dp))
        Text(message.ifBlank { "This device can't open Markhor Prep. Please use the website instead." },
            style = MaterialTheme.typography.titleMedium, color = c.ink, textAlign = TextAlign.Center)
        Spacer(Modifier.height(24.dp))
        PillButton("Sign out", onClick = {
            scope.launch {
                container.account.signOut()
                container.forgetAccount()
                nav.reset(R.SIGNIN)
            }
        }, modifier = Modifier.fillMaxWidth())
    }
}
