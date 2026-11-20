package pk.examwise.app.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import pk.examwise.app.AppContainer
import pk.examwise.app.ui.Load
import pk.examwise.app.ui.R
import pk.examwise.app.ui.components.ErrorState
import pk.examwise.app.ui.components.Loading
import pk.examwise.app.ui.components.Note
import pk.examwise.app.ui.components.Panel
import pk.examwise.app.ui.components.PillButton
import pk.examwise.app.ui.components.TopBar
import pk.examwise.app.ui.components.pct
import pk.examwise.app.ui.rememberLoad
import pk.examwise.app.ui.theme.Ex
import pk.examwise.core.model.Bank
import pk.examwise.core.model.Dashboard

data class HomeData(val banks: List<Bank>, val dashboard: Dashboard)

@Composable
fun HomeScreen(container: AppContainer, nav: NavHostController) {
    val vm = rememberLoad(
        "home",
        cached = {
            val b = container.study.cachedBanks()
            val d = container.study.cachedDashboard()
            if (b != null && d != null) HomeData(b, d) else null
        },
        fresh = { HomeData(container.study.banks(), container.study.dashboard()) },
    )
    val state by vm.state.collectAsStateWithLifecycle()
    val user by container.account.user.collectAsStateWithLifecycle()
    val offlineOn = container.config.config.value?.offline?.enabled == true && user?.isFree == false
    Column(Modifier.fillMaxSize()) {
        TopBar("Home")
        HomeContent(
            state, offlineOn,
            onRetry = vm::refresh,
            onResume = { id -> nav.navigate(R.player(id)) },
            onBank = { id -> nav.navigate(R.practice(id)) },
            onProgress = { nav.navigate(R.PROGRESS) { launchSingleTop = true } },
            onDownloads = { nav.navigate(R.DOWNLOADS) },
        )
    }
}

@Composable
fun HomeContent(
    state: Load<HomeData>,
    offlineOn: Boolean,
    onRetry: () -> Unit,
    onResume: (String) -> Unit,
    onBank: (String) -> Unit,
    onProgress: () -> Unit,
    onDownloads: () -> Unit,
) {
    val data = state.data
    when {
        data == null && state.error != null -> {
            if (state.offline && offlineOn) Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Note("You're offline. Your downloads still work.", "warn")
                PillButton("Open downloads", onDownloads, modifier = Modifier.fillMaxWidth())
            } else ErrorState(state.error, onRetry)
        }
        data == null -> Loading()
        else -> Column(
            Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            val c = Ex.c
            if (state.offline) {
                Note(if (offlineOn) "You're offline. Your downloads still work." else "You're offline. Showing what you saw last.", "warn")
                if (offlineOn) PillButton("Open downloads", onDownloads, dark = false, modifier = Modifier.fillMaxWidth())
            }
            data.dashboard.resume?.let { r ->
                val id = r.attemptId
                if (id != null) Panel {
                    Text("Pick up where you left off", style = MaterialTheme.typography.labelMedium, color = c.muted)
                    Text(r.title, style = MaterialTheme.typography.titleLarge, color = c.ink)
                    Text("${r.done} of ${r.total} answered", style = MaterialTheme.typography.bodyMedium, color = c.muted)
                    PillButton("Resume", { onResume(id) }, modifier = Modifier.fillMaxWidth())
                }
            }
            Text("Start practicing", style = MaterialTheme.typography.headlineSmall, color = c.ink)
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                data.banks.forEach { b -> BankButton(b) { onBank(b.id) } }
            }
            WeekCard(data.dashboard, onProgress)
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun BankButton(bank: Bank, onClick: () -> Unit) {
    val c = Ex.c
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(c.card).clickable(onClick = onClick).padding(horizontal = 18.dp, vertical = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(bank.name, style = MaterialTheme.typography.titleMedium, color = c.ink)
            if (bank.blurb.isNotBlank()) Text(bank.blurb, style = MaterialTheme.typography.bodySmall, color = c.muted, maxLines = 2)
        }
        Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = c.muted)
    }
}

/* Questions answered each of the last seven days, with the week's total and accuracy. */
@Composable
private fun WeekCard(d: Dashboard, onClick: () -> Unit) {
    val c = Ex.c
    val week = d.daily.takeLast(7)
    val answered = week.sumOf { it.answered }
    val correct = week.sumOf { it.correct }
    val top = maxOf(1, week.maxOfOrNull { it.answered } ?: 1)
    Panel(Modifier.clickable(onClick = onClick)) {
        Row(verticalAlignment = Alignment.Bottom) {
            Column(Modifier.weight(1f)) {
                Text("This week", style = MaterialTheme.typography.labelMedium, color = c.muted)
                Text("$answered answered", style = MaterialTheme.typography.headlineSmall, color = c.ink)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(if (answered > 0) "${pct(correct, answered)}%" else "–", style = MaterialTheme.typography.titleLarge, color = c.ink, fontWeight = FontWeight.Bold)
                Text("right", style = MaterialTheme.typography.bodySmall, color = c.muted)
            }
        }
        Row(Modifier.fillMaxWidth().height(72.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.Bottom) {
            week.forEachIndexed { i, day ->
                Column(Modifier.weight(1f).fillMaxHeight(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Bottom) {
                    val frac = if (day.answered > 0) maxOf(0.08f, day.answered.toFloat() / top) else 0.04f
                    Box(Modifier.width(18.dp).weight(1f, fill = false).fillMaxHeight(frac * 0.8f).clip(RoundedCornerShape(5.dp))
                        .background(if (i == week.lastIndex) c.blue else if (day.answered > 0) c.ink.copy(alpha = .5f) else c.line))
                    Spacer(Modifier.height(4.dp))
                    Text(weekday(day.date), style = MaterialTheme.typography.labelSmall, color = c.muted)
                }
            }
        }
        Text("See progress", style = MaterialTheme.typography.labelLarge, color = c.blue)
    }
}

private fun weekday(iso: String): String = runCatching {
    java.time.LocalDate.parse(iso.take(10)).dayOfWeek.getDisplayName(java.time.format.TextStyle.NARROW, java.util.Locale.UK)
}.getOrDefault("")
