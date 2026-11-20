package pk.examwise.app.ui.progress

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import kotlinx.coroutines.launch
import pk.examwise.app.AppContainer
import pk.examwise.app.ui.R
import pk.examwise.app.ui.components.Divider
import pk.examwise.app.ui.components.EmptyState
import pk.examwise.app.ui.components.ErrorState
import pk.examwise.app.ui.components.Loading
import pk.examwise.app.ui.components.Note
import pk.examwise.app.ui.components.Panel
import pk.examwise.app.ui.components.PillButton
import pk.examwise.app.ui.components.RowItem
import pk.examwise.app.ui.components.TopBar
import pk.examwise.app.ui.components.pct
import pk.examwise.app.ui.components.shortDate
import pk.examwise.app.ui.rememberLoad
import pk.examwise.app.ui.review.RItem
import pk.examwise.app.ui.review.ReviewList
import pk.examwise.app.ui.theme.Ex
import pk.examwise.app.ui.watermark.Watermarked
import pk.examwise.core.api.ApiError
import pk.examwise.core.model.Dashboard
import pk.examwise.core.model.StartRequest
import pk.examwise.core.model.TestResult

@Composable
fun ProgressScreen(container: AppContainer, nav: NavHostController) {
    val vm = rememberLoad("progress", cached = { container.study.cachedDashboard() }, fresh = { container.study.dashboard() })
    val state by vm.state.collectAsStateWithLifecycle()
    Column(Modifier.fillMaxSize()) {
        TopBar("Progress")
        val d = state.data
        when {
            d == null && state.error != null -> ErrorState(state.error!!, vm::refresh)
            d == null -> Loading()
            else -> ProgressContent(d, onOpen = { nav.navigate(it) })
        }
    }
}

@Composable
fun ProgressContent(d: Dashboard, onOpen: (String) -> Unit) {
    val c = Ex.c
    val month = d.daily.takeLast(30)
    val answered = month.sumOf { it.answered }
    val correct = month.sumOf { it.correct }
    var openSubject by remember { mutableStateOf<String?>(null) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Stat("Day streak", "${d.streakDays}", Modifier.weight(1f))
            Stat("Answered, 30 days", "$answered", Modifier.weight(1f))
            Stat("Right, 30 days", if (answered > 0) "${pct(correct, answered)}%" else "–", Modifier.weight(1f))
        }
        Panel {
            Text("Last 14 days", style = MaterialTheme.typography.titleMedium, color = c.ink)
            val days = d.daily.takeLast(14)
            val top = maxOf(1, days.maxOfOrNull { it.answered } ?: 1)
            Row(Modifier.fillMaxWidth().height(96.dp), horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.Bottom) {
                days.forEach { day ->
                    Box(Modifier.weight(1f).fillMaxHeight(if (day.answered > 0) maxOf(.06f, day.answered.toFloat() / top) else .03f)
                        .clip(RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp)).background(if (day.answered > 0) c.blue else c.line))
                }
            }
            if (d.dailyGoal > 0) Text("Daily goal: ${d.dailyGoal} questions", style = MaterialTheme.typography.bodySmall, color = c.muted)
        }
        Panel(padding = 0.dp) {
            Text("By subject", style = MaterialTheme.typography.titleMedium, color = c.ink, modifier = Modifier.padding(start = 18.dp, top = 16.dp))
            d.subjects.forEach { s ->
                Divider()
                RowItem(
                    s.subject,
                    "${s.answered} answered · ${if (s.answered > 0) "${pct(s.correct, s.answered)}% right" else "not started"}",
                    onClick = { openSubject = if (openSubject == s.subject) null else s.subject },
                )
                if (openSubject == s.subject) s.chapters.forEach { ch ->
                    Row(Modifier.fillMaxWidth().padding(horizontal = 28.dp, vertical = 8.dp)) {
                        Text(ch.chapter, style = MaterialTheme.typography.bodyMedium, color = c.ink, modifier = Modifier.weight(1f))
                        Text(if (ch.answered > 0) "${pct(ch.correct, ch.answered)}% · ${ch.answered}/${ch.available}" else "0/${ch.available}", style = MaterialTheme.typography.bodySmall, color = c.muted)
                    }
                }
            }
        }
        if (d.weakTopics.isNotEmpty()) Panel {
            Text("Topics to work on", style = MaterialTheme.typography.titleMedium, color = c.ink)
            d.weakTopics.forEach { t ->
                Row {
                    Column(Modifier.weight(1f)) {
                        Text(t.topic, style = MaterialTheme.typography.bodyMedium, color = c.ink)
                        Text("${t.subject} · ${t.chapter}", style = MaterialTheme.typography.bodySmall, color = c.muted)
                    }
                    Text("${pct(t.correct, t.answered)}%", style = MaterialTheme.typography.labelLarge, color = c.bad)
                }
            }
        }
        Panel(padding = 0.dp) {
            Link("History", "Every test you've taken") { onOpen(R.HISTORY) }
            Divider()
            Link("Mistakes", "${d.mistakesToRetry} to try again") { onOpen(R.MISTAKES) }
            Divider()
            Link("Saved questions", "${d.bookmarks} saved") { onOpen(R.BOOKMARKS) }
        }
    }
}

@Composable
private fun Stat(label: String, value: String, modifier: Modifier) {
    val c = Ex.c
    Column(modifier.clip(RoundedCornerShape(18.dp)).background(c.card).padding(14.dp)) {
        Text(value, style = MaterialTheme.typography.headlineSmall, color = c.ink)
        Text(label, style = MaterialTheme.typography.bodySmall, color = c.muted)
    }
}

@Composable
private fun Link(title: String, sub: String, onClick: () -> Unit) {
    RowItem(title, sub, onClick) { Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = Ex.c.muted) }
}

@Composable
fun HistoryScreen(container: AppContainer, nav: NavHostController) {
    val vm = rememberLoad("history", cached = { container.study.cachedHistory() }, fresh = { container.study.history() })
    val state by vm.state.collectAsStateWithLifecycle()
    Column(Modifier.fillMaxSize()) {
        TopBar("History", onBack = { nav.popBackStack() })
        val list = state.data
        when {
            list == null && state.error != null -> ErrorState(state.error!!, vm::refresh)
            list == null -> Loading()
            list.isEmpty() -> EmptyState("No tests yet", "Tests you take show here, newest first.")
            else -> HistoryList(list) { nav.navigate(R.review(it)) }
        }
    }
}

@Composable
fun HistoryList(list: List<TestResult>, onOpen: (String) -> Unit) {
    val c = Ex.c
    LazyColumn(Modifier.fillMaxSize().padding(horizontal = 16.dp)) {
        items(list, key = { it.id }) { t ->
            Panel(Modifier.padding(vertical = 6.dp).clickable { onOpen(t.id) }) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(t.title, style = MaterialTheme.typography.titleMedium, color = c.ink)
                        Text("${shortDate(t.date)} · ${t.minutes} min", style = MaterialTheme.typography.bodySmall, color = c.muted)
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text("${t.score}/${t.total}", style = MaterialTheme.typography.titleMedium, color = c.ink)
                        Text("${pct(t.score, t.total)}%", style = MaterialTheme.typography.bodySmall, color = c.muted)
                    }
                }
            }
        }
    }
}

/* Start a practice set from a list of question IDs (mistakes, saved questions). */
private suspend fun practice(container: AppContainer, nav: NavHostController, ids: List<String>, title: String): String? = try {
    val r = container.study.start(StartRequest(kind = "practice", ids = ids.take(100), tutor = true, timed = false, count = minOf(100, ids.size), title = title))
    nav.navigate(R.player(r.id)); null
} catch (e: ApiError) { e.message }

@Composable
fun MistakesScreen(container: AppContainer, nav: NavHostController) {
    val vm = rememberLoad("mistakes") { container.study.mistakes() }
    val state by vm.state.collectAsStateWithLifecycle()
    val user by container.account.user.collectAsStateWithLifecycle()
    val size by container.prefs.textSize.collectAsState(initial = 0)
    val scope = rememberCoroutineScope()
    var note by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize()) {
        TopBar("Mistakes", onBack = { nav.popBackStack() })
        val list = state.data
        Watermarked(user?.id) {
            when {
                list == null && state.error != null -> ErrorState(state.error!!, vm::refresh)
                list == null -> Loading()
                list.isEmpty() -> EmptyState("No mistakes to retry", "Questions you get wrong show here until you get them right.")
                else -> ReviewList(list.map { RItem(it.q, it.chosen) }, size) {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        note?.let { Note(it, "bad") }
                        PillButton("Practice these", busy = busy, modifier = Modifier.fillMaxWidth(), onClick = {
                            busy = true
                            scope.launch { note = practice(container, nav, list.map { it.q.id }, "Mistakes"); busy = false }
                        })
                    }
                }
            }
        }
    }
}

@Composable
fun BookmarksScreen(container: AppContainer, nav: NavHostController) {
    val vm = rememberLoad("bookmarks") { container.study.bookmarks() }
    val state by vm.state.collectAsStateWithLifecycle()
    val user by container.account.user.collectAsStateWithLifecycle()
    val size by container.prefs.textSize.collectAsState(initial = 0)
    val scope = rememberCoroutineScope()
    var note by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize()) {
        TopBar("Saved questions", onBack = { nav.popBackStack() })
        val list = state.data
        Watermarked(user?.id) {
            when {
                list == null && state.error != null -> ErrorState(state.error!!, vm::refresh)
                list == null -> Loading()
                list.isEmpty() -> EmptyState("Nothing saved yet", "Tap the bookmark on any question to keep it here.")
                else -> ReviewList(list.map { RItem(it, null) }, size) {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        note?.let { Note(it, "bad") }
                        PillButton("Practice these", busy = busy, modifier = Modifier.fillMaxWidth(), onClick = {
                            busy = true
                            scope.launch { note = practice(container, nav, list.map { it.id }, "Saved questions"); busy = false }
                        })
                    }
                }
            }
        }
    }
}
