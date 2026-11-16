package pk.examwise.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.autofill.ContentType
import androidx.compose.ui.semantics.contentType
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import pk.examwise.app.ui.theme.Ex
import pk.examwise.app.ui.theme.tint

/* The one sentence the app may say about paying. Nothing in it can be tapped. */
const val PASS_SENTENCE = "Get a pass on our website to open this."

@Composable
fun PillButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true, busy: Boolean = false, dark: Boolean = true) {
    val c = Ex.c
    Button(
        onClick = onClick,
        enabled = enabled && !busy,
        modifier = modifier.heightIn(min = 48.dp),
        shape = RoundedCornerShape(999.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (dark) c.pill else c.bg, contentColor = if (dark) c.onPill else c.ink,
            disabledContainerColor = c.line, disabledContentColor = c.muted,
        ),
        contentPadding = PaddingValues(horizontal = 22.dp, vertical = 12.dp),
    ) {
        if (busy) CircularProgressIndicator(Modifier.size(18.dp), strokeWidth = 2.dp, color = c.muted)
        else Text(text, style = MaterialTheme.typography.labelLarge)
    }
}

@Composable
fun LinkButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier, color: Color = Ex.c.blue) {
    TextButton(onClick = onClick, modifier = modifier) { Text(text, color = color, style = MaterialTheme.typography.labelLarge) }
}

@Composable
fun Field(
    value: String,
    onChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    password: Boolean = false,
    keyboard: KeyboardType = KeyboardType.Text,
    enabled: Boolean = true,
    autofill: ContentType? = null,
) {
    val c = Ex.c
    Column(modifier) {
        Text(label, style = MaterialTheme.typography.labelMedium, color = c.muted)
        Spacer(Modifier.height(6.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onChange,
            singleLine = true,
            enabled = enabled,
            visualTransformation = if (password) PasswordVisualTransformation() else VisualTransformation.None,
            keyboardOptions = KeyboardOptions(keyboardType = if (password) KeyboardType.Password else keyboard),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = c.blue, unfocusedBorderColor = c.line, focusedContainerColor = c.card, unfocusedContainerColor = c.card,
            ),
            modifier = Modifier.fillMaxWidth().then(if (autofill != null) Modifier.semantics { contentType = autofill } else Modifier),
        )
    }
}

@Composable
fun Panel(modifier: Modifier = Modifier, padding: Dp = 18.dp, content: @Composable ColumnScope.() -> Unit) {
    val c = Ex.c
    Column(
        modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(c.card).padding(padding),
        verticalArrangement = Arrangement.spacedBy(10.dp),
        content = content,
    )
}

/* A message in a soft box: good, bad, warn or plain. */
@Composable
fun Note(text: String, kind: String = "plain", modifier: Modifier = Modifier) {
    val c = Ex.c
    val bg = when (kind) { "good" -> c.tint(c.good, .11f); "bad" -> c.tint(c.bad, .10f); "warn" -> c.tint(c.warn, .12f); else -> c.sky }
    Text(text, modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(bg).padding(horizontal = 12.dp, vertical = 10.dp),
        style = MaterialTheme.typography.bodyMedium, color = c.ink)
}

@Composable
fun PassLine(modifier: Modifier = Modifier) {
    val c = Ex.c
    Row(modifier, verticalAlignment = Alignment.CenterVertically) {
        Icon(Icons.Filled.Lock, contentDescription = null, tint = c.muted, modifier = Modifier.size(16.dp))
        Spacer(Modifier.width(8.dp))
        Text(PASS_SENTENCE, style = MaterialTheme.typography.bodyMedium, color = c.muted)
    }
}

@Composable
fun Loading(modifier: Modifier = Modifier) {
    Box(modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Ex.c.blue) }
}

/* A failed load: the server's message and a way to try again. */
@Composable
fun ErrorState(message: String, onRetry: (() -> Unit)?, modifier: Modifier = Modifier) {
    val c = Ex.c
    Column(modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(message, style = MaterialTheme.typography.bodyLarge, color = c.ink, textAlign = TextAlign.Center)
        if (onRetry != null) {
            Spacer(Modifier.height(16.dp))
            PillButton("Try again", onRetry, dark = false)
        }
    }
}

@Composable
fun EmptyState(title: String, text: String, modifier: Modifier = Modifier) {
    val c = Ex.c
    Column(modifier.fillMaxWidth().padding(vertical = 32.dp, horizontal = 16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(title, style = MaterialTheme.typography.titleMedium, color = c.ink, textAlign = TextAlign.Center)
        Spacer(Modifier.height(6.dp))
        Text(text, style = MaterialTheme.typography.bodyMedium, color = c.muted, textAlign = TextAlign.Center)
    }
}

/* The slim top bar with the page title, and a back arrow on pages below the tabs. */
@Composable
fun TopBar(title: String, onBack: (() -> Unit)? = null, actions: @Composable () -> Unit = {}) {
    val c = Ex.c
    Row(
        Modifier.fillMaxWidth().background(c.bg).height(56.dp).padding(horizontal = if (onBack != null) 4.dp else 18.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (onBack != null) IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = c.ink) }
        Text(title, style = MaterialTheme.typography.titleLarge, color = c.ink, modifier = Modifier.weight(1f), maxLines = 1)
        actions()
    }
}

@Composable
fun RowItem(title: String, subtitle: String? = null, onClick: (() -> Unit)? = null, trailing: @Composable () -> Unit = {}) {
    val c = Ex.c
    Row(
        Modifier.fillMaxWidth().then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier).padding(horizontal = 18.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.bodyLarge, color = c.ink, fontWeight = FontWeight.SemiBold)
            if (subtitle != null) Text(subtitle, style = MaterialTheme.typography.bodySmall, color = c.muted)
        }
        trailing()
    }
}

@Composable
fun Divider() {
    Box(Modifier.fillMaxWidth().height(1.dp).background(Ex.c.line))
}

@Composable
fun Chip(text: String, selected: Boolean, onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true) {
    val c = Ex.c
    Text(
        text,
        modifier
            .clip(RoundedCornerShape(999.dp))
            .background(if (selected) c.pill else c.bg)
            .then(if (!selected) Modifier.border(1.dp, c.line, RoundedCornerShape(999.dp)) else Modifier)
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 8.dp),
        color = if (selected) c.onPill else if (enabled) c.ink else c.muted,
        style = MaterialTheme.typography.labelMedium,
    )
}

/* Percent with no decimals; 0 when there is nothing to divide. */
fun pct(n: Int, of: Int): Int = if (of <= 0) 0 else Math.round(n * 100f / of)

/* "16 Nov" from an ISO date. */
fun shortDate(iso: String?): String {
    if (iso.isNullOrBlank() || iso.length < 10) return ""
    val months = listOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
    val m = iso.substring(5, 7).toIntOrNull() ?: return iso.take(10)
    val d = iso.substring(8, 10).toIntOrNull() ?: return iso.take(10)
    return "$d ${months[(m - 1).coerceIn(0, 11)]} ${iso.take(4)}"
}
