package pk.examwise.app.ui.offline

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import kotlinx.coroutines.launch
import pk.examwise.app.AppContainer
import pk.examwise.app.data.db.PackSummary
import pk.examwise.app.ui.R
import pk.examwise.app.ui.components.Chip
import pk.examwise.app.ui.components.Divider
import pk.examwise.app.ui.components.EmptyState
import pk.examwise.app.ui.components.LinkButton
import pk.examwise.app.ui.components.Note
import pk.examwise.app.ui.components.Panel
import pk.examwise.app.ui.components.PillButton
import pk.examwise.app.ui.components.TopBar
import pk.examwise.app.ui.components.shortDate
import pk.examwise.app.ui.practice.BankChips
import pk.examwise.app.ui.practice.ChapterPicker
import pk.examwise.app.ui.practice.Selection
import pk.examwise.app.ui.theme.Ex
import pk.examwise.core.api.ApiError
import pk.examwise.core.model.Bank
import pk.examwise.core.model.Catalog

private val PACK_SIZES = listOf(25, 50, 100)

/* Offline packs: what's on the phone, and a picker to download more. */
@Composable
fun DownloadsScreen(container: AppContainer, nav: NavHostController) {
    val c = Ex.c
    val scope = rememberCoroutineScope()
    val packs by container.offline.packs.collectAsState(initial = null)
    val sessions by container.offline.sessions.collectAsState(initial = emptyList())
    val cap = container.config.config.value?.offline?.maxQuestions ?: 300
    val usable = remember { mutableStateMapOf<String, Boolean>() }
    var picking by remember { mutableStateOf(false) }
    var note by remember { mutableStateOf<String?>(null) }
    var deleting by remember { mutableStateOf<PackSummary?>(null) }

    LaunchedEffect(Unit) { runCatching { container.offline.renew() } }
    LaunchedEffect(packs) { packs?.forEach { usable[it.id] = container.offline.usable(it.expiresAt) } }

    Column(Modifier.fillMaxSize()) {
        TopBar(if (picking) "Download questions" else "Downloads", onBack = { if (picking) picking = false else nav.popBackStack() })
        if (picking) {
            DownloadPicker(container, onDone = { n -> picking = false; note = "Saved $n questions for offline practice." })
            return@Column
        }
        Column(Modifier.verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            val held = packs?.sumOf { it.questionCount } ?: 0
            Text("$held of $cap saved", style = MaterialTheme.typography.titleMedium, color = c.ink)
            note?.let { Note(it, "good") }
            PillButton("Download questions", { note = null; picking = true }, enabled = held < cap, modifier = Modifier.fillMaxWidth())
            val list = packs
            if (list != null && list.isEmpty()) EmptyState("Nothing downloaded", "Download questions to practice without a connection.")
            if (!list.isNullOrEmpty()) Panel(padding = 0.dp) {
                list.forEachIndexed { i, p ->
                    if (i > 0) Divider()
                    val ok = usable[p.id] ?: true
                    Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(p.title, style = MaterialTheme.typography.titleMedium, color = c.ink)
                            Text(
                                if (!ok) "Connect to the internet to continue." else "${p.answered} of ${p.questionCount} answered",
                                style = MaterialTheme.typography.bodySmall, color = if (ok) c.muted else c.warn,
                            )
                        }
                        if (ok && p.answered < p.questionCount) PillButton("Practice", { nav.navigate(R.offlinePlayer(p.id)) }, dark = false)
                        LinkButton("Delete", { deleting = p }, color = c.bad)
                    }
                }
            }
            if (sessions.isNotEmpty()) {
                Text("Offline sessions", style = MaterialTheme.typography.titleMedium, color = c.ink)
                Panel(padding = 0.dp) {
                    sessions.take(20).forEachIndexed { i, s ->
                        if (i > 0) Divider()
                        Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(s.title, style = MaterialTheme.typography.bodyLarge, color = c.ink)
                                Text((s.finishedAt?.let { shortDate(java.time.Instant.ofEpochMilli(it).toString()) } ?: "") + if (s.synced) "" else " · not sent yet",
                                    style = MaterialTheme.typography.bodySmall, color = c.muted)
                            }
                            LinkButton("Review", { nav.navigate(R.localReview(s.id)) })
                        }
                    }
                }
            }
        }
    }

    deleting?.let { p ->
        AlertDialog(
            onDismissRequest = { deleting = null },
            title = { Text("Delete this download?") },
            text = { Text(if (p.answered == p.questionCount) "You've answered every question in it. Delete it to make room for new ones." else "Its questions leave your phone. Answers you've given are kept.") },
            confirmButton = { TextButton({ deleting = null; scope.launch { container.offline.delete(p.id) } }) { Text("Delete") } },
            dismissButton = { TextButton({ deleting = null }) { Text("Cancel") } },
        )
    }
}

@Composable
private fun DownloadPicker(container: AppContainer, onDone: (Int) -> Unit) {
    val c = Ex.c
    val scope = rememberCoroutineScope()
    var banks by remember { mutableStateOf<List<Bank>>(emptyList()) }
    var bankId by remember { mutableStateOf("mdcat") }
    var catalog by remember { mutableStateOf<Catalog?>(null) }
    var sel by remember { mutableStateOf<Selection>(Selection.None) }
    var count by remember { mutableStateOf(25) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(Unit) {
        banks = container.study.cachedBanks() ?: runCatching { container.study.banks() }.getOrDefault(emptyList())
    }
    LaunchedEffect(bankId) {
        catalog = container.study.cachedCatalog(bankId)
        runCatching { container.study.catalog(bankId) }.onSuccess { catalog = it }
    }
    val bank = banks.firstOrNull { it.id == bankId }
    Column(Modifier.verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        BankChips(banks, bankId) { bankId = it; sel = Selection.None }
        if (bank != null) ChapterPicker(bank, catalog, sel, paid = true) { sel = it }
        Text("How many", style = MaterialTheme.typography.titleMedium, color = c.ink)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { PACK_SIZES.forEach { n -> Chip("$n", count == n, { count = n }) } }
        error?.let { Note(it, "warn") }
        PillButton("Download ${sel.summary()}", busy = busy, modifier = Modifier.fillMaxWidth(), onClick = {
            busy = true; error = null
            scope.launch {
                try { onDone(container.offline.download(bankId, sel.subjects, sel.chapters, count)) }
                catch (e: ApiError) { error = e.message }
                finally { busy = false }
            }
        })
    }
}
