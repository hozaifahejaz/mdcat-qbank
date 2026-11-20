package pk.examwise.app.ui.mocks

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
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
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonPrimitive
import pk.examwise.app.AppContainer
import pk.examwise.app.ui.R
import pk.examwise.app.ui.components.Divider
import pk.examwise.app.ui.components.EmptyState
import pk.examwise.app.ui.components.ErrorState
import pk.examwise.app.ui.components.LinkButton
import pk.examwise.app.ui.components.Loading
import pk.examwise.app.ui.components.Note
import pk.examwise.app.ui.components.Panel
import pk.examwise.app.ui.components.PassLine
import pk.examwise.app.ui.components.PillButton
import pk.examwise.app.ui.components.TopBar
import pk.examwise.app.ui.components.pct
import pk.examwise.app.ui.components.shortDate
import pk.examwise.app.ui.rememberLoad
import pk.examwise.app.ui.theme.Ex
import pk.examwise.core.api.ApiError
import pk.examwise.core.model.Catalog
import pk.examwise.core.model.StartRequest
import pk.examwise.core.model.TestResult

data class MocksData(val catalog: Catalog, val history: List<TestResult>)

@Composable
fun MocksScreen(container: AppContainer, nav: NavHostController) {
    val vm = rememberLoad(
        "mocks",
        cached = {
            val c = container.study.cachedCatalog("mdcat"); val h = container.study.cachedHistory()
            if (c != null && h != null) MocksData(c, h) else null
        },
        fresh = { MocksData(container.study.catalog("mdcat"), container.study.history()) },
    )
    val state by vm.state.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()
    var busy by remember { mutableStateOf<String?>(null) }
    var note by remember { mutableStateOf<String?>(null) }
    var openTest by remember { mutableStateOf<String?>(null) }
    var needsPass by remember { mutableStateOf(false) }

    fun start(key: String, r: StartRequest) {
        busy = key; note = null; openTest = null; needsPass = false
        scope.launch {
            try {
                val s = container.study.start(r)
                nav.navigate(R.player(s.id))
            } catch (e: ApiError) {
                note = e.message
                needsPass = e.code == "needs_pass"
                if (e.code == "open_test") openTest = e.extra["attempt"]?.jsonPrimitive?.contentOrNull
            } finally { busy = null }
        }
    }

    Column(Modifier.fillMaxSize()) {
        TopBar("Mocks")
        val data = state.data
        when {
            data == null && state.error != null -> ErrorState(state.error!!, vm::refresh)
            data == null -> Loading()
            else -> MocksContent(
                data, busy, note, needsPass, openTest,
                onStart = ::start,
                onReview = { nav.navigate(R.review(it)) },
                onResume = { nav.navigate(R.player(it)) },
            )
        }
    }
}

@Composable
fun MocksContent(
    data: MocksData,
    busy: String?,
    note: String?,
    needsPass: Boolean,
    openTest: String?,
    onStart: (String, StartRequest) -> Unit,
    onReview: (String) -> Unit,
    onResume: (String) -> Unit,
) {
    val c = Ex.c
    val cat = data.catalog
    val paid = cat.paid
    val taken = data.history.filter { it.kind == "mock" }.associateBy { it.title }
    val mini = data.history.firstOrNull { it.kind == "mini-mock" }
    val nextMock = (1..maxOf(1, cat.mocks)).firstOrNull { "Full mock $it" !in taken } ?: 1
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        note?.let {
            Note(it, if (needsPass) "warn" else "bad")
            if (needsPass) PassLine()
            openTest?.let { id -> PillButton("Resume that test", { onResume(id) }, dark = false, modifier = Modifier.fillMaxWidth()) }
        }
        Text("180 MCQs in 3 hours, split by subject like the real paper.", style = MaterialTheme.typography.bodyMedium, color = c.muted)

        if (!paid) Panel {
            Text("Your free mini mock", style = MaterialTheme.typography.titleMedium, color = c.ink)
            when {
                mini != null -> {
                    Text("${mini.score}/${mini.total} on ${shortDate(mini.date)}", style = MaterialTheme.typography.bodyLarge, color = c.ink)
                    LinkButton("Review answers", { onReview(mini.id) })
                }
                cat.miniOpen != null -> {
                    val open = cat.miniOpen.orEmpty()
                    Text("You started your mini mock. Its clock keeps running, so finish it while you can.", style = MaterialTheme.typography.bodyMedium, color = c.muted)
                    PillButton("Resume the mini mock", { onResume(open) }, modifier = Modifier.fillMaxWidth())
                }
                cat.miniReady && !cat.miniUsed -> {
                    Text("30 questions in 30 minutes, in the real paper's proportions. One per free account.", style = MaterialTheme.typography.bodyMedium, color = c.muted)
                    PillButton("Start the mini mock", { onStart("mini", StartRequest(kind = "mini-mock")) }, busy = busy == "mini", modifier = Modifier.fillMaxWidth())
                }
                else -> Text("Opens once the free set has a few more questions.", style = MaterialTheme.typography.bodyMedium, color = c.muted)
            }
        }

        Text("Full mocks", style = MaterialTheme.typography.titleLarge, color = c.ink)
        if (!cat.mockReady) EmptyState("Mocks open soon", "Full-length mocks open once the question bank has enough questions in every subject.")
        else Panel(padding = 0.dp) {
            if (!paid) Row(Modifier.padding(horizontal = 18.dp, vertical = 14.dp)) { PassLine() }
            (1..cat.mocks).forEachIndexed { i, k ->
                if (i > 0 || !paid) Divider()
                val title = "Full mock $k"
                val t = taken[title]
                Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(title, style = MaterialTheme.typography.titleMedium, color = c.ink)
                        Text(
                            if (t != null) "${t.score}/${t.total} · ${pct(t.score, t.total)}% · ${shortDate(t.date)}" else if (paid && k == nextMock) "Up next · 180 MCQs · 3 hours" else "180 MCQs · 3 hours",
                            style = MaterialTheme.typography.bodySmall, color = c.muted,
                        )
                    }
                    when {
                        t != null -> LinkButton("Review", { onReview(t.id) })
                        paid -> PillButton("Start", { onStart("mock$k", StartRequest(kind = "mock", mock = k)) }, dark = k == nextMock, busy = busy == "mock$k")
                    }
                }
            }
        }

        Text("Past papers", style = MaterialTheme.typography.titleLarge, color = c.ink)
        if (cat.papers.isEmpty()) EmptyState("Past papers coming soon", "PMDC MDCAT papers from recent years, each with a full explanation on every question.")
        else Panel(padding = 0.dp) {
            if (!paid) Row(Modifier.padding(horizontal = 18.dp, vertical = 14.dp)) { PassLine() }
            cat.papers.forEachIndexed { i, p ->
                if (i > 0 || !paid) Divider()
                val t = data.history.firstOrNull { it.kind == "past-paper" && it.title.endsWith(p.year.toString()) }
                Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("PMDC MDCAT ${p.year}", style = MaterialTheme.typography.titleMedium, color = c.ink)
                        Text(
                            if (t != null) "${t.score}/${t.total} · ${shortDate(t.date)}" else "${p.count} MCQs · ${p.count} minutes",
                            style = MaterialTheme.typography.bodySmall, color = c.muted,
                        )
                    }
                    if (t != null) LinkButton("Review", { onReview(t.id) })
                    if (paid) PillButton(if (t != null) "Retake" else "Start", { onStart("paper${p.year}", StartRequest(kind = "past-paper", paper = p.year)) }, dark = false, busy = busy == "paper${p.year}")
                }
            }
        }
    }
}
