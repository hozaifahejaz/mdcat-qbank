package pk.examwise.app.ui.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import pk.examwise.app.AppContainer
import pk.examwise.app.data.GoogleSignIn
import pk.examwise.app.ui.R
import pk.examwise.app.ui.components.Field
import pk.examwise.app.ui.components.LinkButton
import pk.examwise.app.ui.components.Note
import pk.examwise.app.ui.components.PillButton
import pk.examwise.app.ui.reset
import pk.examwise.app.ui.start.Logo
import pk.examwise.app.ui.theme.Ex
import pk.examwise.core.api.ApiError
import pk.examwise.core.model.AuthConfig
import pk.examwise.core.model.SignInResult

/* After any sign-in: load the account, keep offline rows only for it, then claim this phone. */
suspend fun afterSignIn(container: AppContainer, nav: NavHostController) {
    val user = runCatching { container.account.refresh() }.getOrNull()
    if (user == null) { nav.reset(R.SIGNIN); return }
    container.offline.claimFor(user.id)
    if (user.isFree) container.offline.wipePacks()
    nav.reset(R.GATE)
}

@Composable
fun AuthPage(title: String, subtitle: String? = null, onBack: (() -> Unit)? = null, content: @Composable () -> Unit) {
    val c = Ex.c
    Column(
        Modifier.fillMaxSize().imePadding().verticalScroll(rememberScrollState()).padding(horizontal = 24.dp, vertical = 28.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Column(Modifier.widthIn(max = 440.dp).fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            if (onBack != null) LinkButton("Back", onBack, color = c.muted)
            Logo(44)
            Spacer(Modifier.height(4.dp))
            Text(title, style = MaterialTheme.typography.headlineMedium, color = c.ink)
            if (subtitle != null) Text(subtitle, style = MaterialTheme.typography.bodyLarge, color = c.muted)
            Spacer(Modifier.height(4.dp))
            content()
        }
    }
}

@Composable
private fun rememberAuthConfig(container: AppContainer): AuthConfig? {
    var cfg by remember { mutableStateOf<AuthConfig?>(null) }
    LaunchedEffect(Unit) { cfg = container.config.authConfig() }
    return cfg
}

@Composable
fun SignInScreen(container: AppContainer, nav: NavHostController) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val cfg = rememberAuthConfig(container)
    val webClientId = container.config.config.value?.google?.webClientId
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var unconfirmed by remember { mutableStateOf(false) }
    var info by remember { mutableStateOf<String?>(null) }

    AuthPage("Sign in", "Welcome back. Pick up where you left off.") {
        Field(email, { email = it }, "Email", keyboard = KeyboardType.Email)
        Field(password, { password = it }, "Password", password = true)
        error?.let { Note(it, "bad") }
        info?.let { Note(it, "good") }
        if (unconfirmed) LinkButton("Send the link again", {
            scope.launch {
                runCatching { container.account.resend(email) }
                    .onSuccess { info = "Check your email for a new link."; error = null; unconfirmed = false }
                    .onFailure { error = it.message }
            }
        })
        PillButton("Sign in", busy = busy, enabled = email.isNotBlank() && password.isNotEmpty(), modifier = Modifier.fillMaxWidth(), onClick = {
            busy = true; error = null; info = null; unconfirmed = false
            scope.launch {
                try {
                    container.account.signIn(email, password)
                    afterSignIn(container, nav)
                } catch (e: ApiError) {
                    error = e.message
                    unconfirmed = e.code == "email_not_confirmed"
                } finally { busy = false }
            }
        })
        if (cfg?.google == true && !webClientId.isNullOrBlank()) {
            PillButton("Continue with Google", dark = false, modifier = Modifier.fillMaxWidth(), busy = busy, onClick = {
                busy = true; error = null
                scope.launch {
                    try {
                        when (val r = GoogleSignIn.pick(context, webClientId)) {
                            is GoogleSignIn.Result.Token -> { container.account.google(r.idToken); afterSignIn(container, nav) }
                            GoogleSignIn.Result.Cancelled -> Unit
                            is GoogleSignIn.Result.Failed -> error = r.message
                        }
                    } catch (e: ApiError) { error = e.message } finally { busy = false }
                }
            })
        }
        if (cfg?.phone == true) PillButton("Use phone number", { nav.navigate(R.PHONE) }, dark = false, modifier = Modifier.fillMaxWidth())
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            LinkButton("Create an account", { nav.navigate(R.SIGNUP) })
            if (cfg?.passwordReset == true) LinkButton("Forgot password?", { nav.navigate(R.FORGOT) }, color = Ex.c.muted)
        }
    }
}

@Composable
fun SignUpScreen(container: AppContainer, nav: NavHostController) {
    val scope = rememberCoroutineScope()
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var checkEmail by remember { mutableStateOf(false) }
    var info by remember { mutableStateOf<String?>(null) }

    if (checkEmail) {
        AuthPage("Check your email", "We sent a link to $email. Open it, then sign in here.") {
            info?.let { Note(it, "good") }
            error?.let { Note(it, "bad") }
            PillButton("Send it again", dark = false, busy = busy, modifier = Modifier.fillMaxWidth(), onClick = {
                busy = true
                scope.launch {
                    runCatching { container.account.resend(email) }
                        .onSuccess { info = "Sent. It can take a minute to arrive."; error = null }
                        .onFailure { error = it.message }
                    busy = false
                }
            })
            PillButton("Sign in", { nav.reset(R.SIGNIN) }, modifier = Modifier.fillMaxWidth())
        }
        return
    }

    AuthPage("Create your account", "Free to start. No card needed.", onBack = { nav.popBackStack() }) {
        Field(name, { name = it }, "Your name")
        Field(email, { email = it }, "Email", keyboard = KeyboardType.Email)
        Field(password, { password = it }, "Password (8 or more characters)", password = true)
        error?.let { Note(it, "bad") }
        PillButton("Create account", busy = busy, enabled = name.isNotBlank() && email.isNotBlank() && password.length >= 8, modifier = Modifier.fillMaxWidth(), onClick = {
            busy = true; error = null
            scope.launch {
                try {
                    val r: SignInResult = container.account.signUp(name, email, password)
                    if (r.status == "check_email") checkEmail = true else afterSignIn(container, nav)
                } catch (e: ApiError) { error = e.message } finally { busy = false }
            }
        })
        LinkButton("I already have an account", { nav.popBackStack() })
    }
}

@Composable
fun PhoneScreen(container: AppContainer, nav: NavHostController) {
    val scope = rememberCoroutineScope()
    var phone by remember { mutableStateOf("") }
    var sentTo by remember { mutableStateOf<String?>(null) }
    var code by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var wait by remember { mutableIntStateOf(0) }

    LaunchedEffect(wait > 0) { while (wait > 0) { delay(1000); wait-- } }

    fun send() {
        busy = true; error = null
        scope.launch {
            try {
                val r = container.account.phoneStart(phone)
                sentTo = r.phone ?: phone
                wait = 55
            } catch (e: ApiError) { error = e.message } finally { busy = false }
        }
    }

    if (sentTo == null) {
        AuthPage("Use your phone", "We'll text you a 6-digit code.", onBack = { nav.popBackStack() }) {
            Field(phone, { phone = it }, "Mobile number (0300 1234567)", keyboard = KeyboardType.Phone)
            error?.let { Note(it, "bad") }
            PillButton("Send code", busy = busy, enabled = phone.count(Char::isDigit) >= 10, modifier = Modifier.fillMaxWidth(), onClick = ::send)
        }
    } else {
        AuthPage("Enter the code", "Sent to $sentTo.", onBack = { sentTo = null; code = "" }) {
            Field(code, { code = it.filter(Char::isDigit).take(6) }, "6-digit code", keyboard = KeyboardType.NumberPassword)
            Field(name, { name = it }, "Your name (new accounts)")
            error?.let { Note(it, "bad") }
            PillButton("Continue", busy = busy, enabled = code.length == 6, modifier = Modifier.fillMaxWidth(), onClick = {
                busy = true; error = null
                scope.launch {
                    try {
                        container.account.phoneVerify(sentTo!!, code, name.ifBlank { null })
                        afterSignIn(container, nav)
                    } catch (e: ApiError) { error = e.message } finally { busy = false }
                }
            })
            if (wait > 0) Text("Send a new code in ${wait}s", style = MaterialTheme.typography.bodySmall, color = Ex.c.muted)
            else LinkButton("Send a new code", ::send)
        }
    }
}

@Composable
fun ForgotScreen(container: AppContainer, nav: NavHostController) {
    val scope = rememberCoroutineScope()
    var email by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var sent by remember { mutableStateOf(false) }
    AuthPage("Reset your password", "We'll email you a link. Open it to choose a new password, then sign in here.", onBack = { nav.popBackStack() }) {
        Field(email, { email = it }, "Email", keyboard = KeyboardType.Email)
        error?.let { Note(it, "bad") }
        if (sent) Note("If that email has an account, a link is on its way.", "good")
        PillButton("Send link", busy = busy, enabled = email.isNotBlank(), modifier = Modifier.fillMaxWidth(), onClick = {
            busy = true; error = null
            scope.launch {
                try { container.account.forgot(email); sent = true } catch (e: ApiError) { error = e.message } finally { busy = false }
            }
        })
    }
}
