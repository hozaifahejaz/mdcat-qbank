package com.markhorprep.app.ui.practice

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonPrimitive
import com.markhorprep.app.AppContainer
import com.markhorprep.app.ui.R
import com.markhorprep.app.ui.components.Chip
import com.markhorprep.app.ui.components.ErrorState
import com.markhorprep.app.ui.components.LinkButton
import com.markhorprep.app.ui.components.Loading
import com.markhorprep.app.ui.components.Note
import com.markhorprep.app.ui.components.Panel
import com.markhorprep.app.ui.components.PassLine
import com.markhorprep.app.ui.components.PillButton
import com.markhorprep.app.ui.components.TopBar
import com.markhorprep.app.ui.theme.Ex
import com.markhorprep.core.api.ApiError
import com.markhorprep.core.model.Bank
import com.markhorprep.core.model.Catalog
import com.markhorprep.core.model.Filter
import com.markhorprep.core.model.Pool
import com.markhorprep.core.model.StartRequest

val COUNTS = listOf(10, 25, 50, 100)

data class PracticeState(
    val banks: List<Bank> = emptyList(),
    val bankId: String = "mdcat",
    val catalog: Catalog? = null,
    val sel: Selection = Selection.None,
    val tutor: Boolean = true,
    val timed: Boolean = false,
    val filters: Set<Filter> = emptySet(),
    val count: Int = 25,
    val pool: Pool? = null,
    val loading: Boolean = true,
    val error: String? = null,
    val starting: Boolean = false,
    val startError: String? = null,
    val needsPass: Boolean = false,
    val openTest: String? = null,
) {
    val bank: Bank? get() = banks.firstOrNull { it.id == bankId }
    val paid: Boolean get() = catalog?.paid ?: false
    /* How many questions the picks match: the pool when known, else the catalog's open count. */
    val match: Int get() = pool?.match(filters) ?: catalog.counts(sel.subjects, sel.chapters).open
    val starts: Int get() = minOf(count, match)
}

class PracticeViewModel(private val container: AppContainer, initialBank: String?) : ViewModel() {
    private val _state = MutableStateFlow(PracticeState())
    val state: StateFlow<PracticeState> = _state.asStateFlow()
    private var poolJob: Job? = null

    /* Set when a start succeeds: the sitting to open. */
    val started = MutableStateFlow<String?>(null)

    init {
        viewModelScope.launch {
            val bank = initialBank ?: container.prefs.lastBank() ?: "mdcat"
            container.study.cachedBanks()?.let { b -> _state.update { it.copy(banks = b, bankId = bank) } }
            try {
                val b = container.study.banks()
                _state.update { it.copy(banks = b, bankId = if (b.any { x -> x.id == bank }) bank else b.firstOrNull()?.id ?: "mdcat") }
                loadBank()
            } catch (e: ApiError) {
                _state.update { it.copy(loading = false, error = if (it.banks.isEmpty()) e.message else null) }
                if (_state.value.banks.isNotEmpty()) loadBank()
            }
        }
    }

    fun retry() { _state.update { it.copy(error = null, loading = true) }; viewModelScope.launch { runCatching { _state.update { s -> s.copy(banks = container.study.banks()) } }; loadBank() } }

    fun pickBank(id: String) {
        if (id == _state.value.bankId) return
        _state.update { it.copy(bankId = id, catalog = null, sel = Selection.None, pool = null) }
        viewModelScope.launch { container.prefs.setLastBank(id); loadBank() }
    }

    private suspend fun loadBank() {
        val id = _state.value.bankId
        _state.update { it.copy(loading = true) }
        container.study.cachedCatalog(id)?.let { c -> _state.update { if (it.bankId == id) it.copy(catalog = c) else it } }
        try {
            val c = container.study.catalog(id)
            _state.update { if (it.bankId == id) it.copy(catalog = c, loading = false, error = null) else it }
        } catch (e: ApiError) {
            _state.update { it.copy(loading = false, error = if (it.catalog == null) e.message else null) }
        }
        loadPool()
    }

    fun select(sel: Selection) { _state.update { it.copy(sel = sel, pool = null) }; loadPool() }

    private fun loadPool() {
        poolJob?.cancel()
        val s = _state.value
        poolJob = viewModelScope.launch {
            runCatching { container.study.pool(s.bankId, s.sel.subjects, s.sel.chapters) }.getOrNull()?.let { p ->
                _state.update { if (it.sel == s.sel && it.bankId == s.bankId) it.copy(pool = p) else it }
            }
        }
    }

    fun setTutor(v: Boolean) = _state.update { it.copy(tutor = v) }
    fun setTimed(v: Boolean) = _state.update { it.copy(timed = v) }
    fun toggleFilter(f: Filter) = _state.update { it.copy(filters = if (f in it.filters) it.filters - f else it.filters + f) }
    fun setCount(n: Int) = _state.update { it.copy(count = n) }

    fun start() {
        val s = _state.value
        _state.update { it.copy(starting = true, startError = null, needsPass = false, openTest = null) }
        viewModelScope.launch {
            try {
                val r = container.study.start(
                    StartRequest(
                        kind = "practice", bank = s.bankId, tutor = s.tutor, timed = s.timed, count = s.count,
                        filters = s.filters.map { it.wire }.ifEmpty { null },
                        subject = s.sel.subjects.singleOrNull(),
                        subjects = s.sel.subjects.takeIf { it.size > 1 },
                        chapters = s.sel.chapters.ifEmpty { null },
                    ),
                )
                started.value = r.id
            } catch (e: ApiError) {
                _state.update {
                    it.copy(
                        startError = e.message,
                        needsPass = e.code == "needs_pass",
                        openTest = if (e.code == "open_test") e.extra["attempt"]?.jsonPrimitive?.contentOrNull else null,
                    )
                }
            } finally { _state.update { it.copy(starting = false) } }
        }
    }
}

@Composable
fun PracticeScreen(container: AppContainer, nav: NavHostController, bank: String?) {
    val vm: PracticeViewModel = viewModel(key = "practice:$bank") { PracticeViewModel(container, bank) }
    val state by vm.state.collectAsStateWithLifecycle()
    val started by vm.started.collectAsStateWithLifecycle()
    LaunchedEffect(started) { started?.let { vm.started.value = null; nav.navigate(R.player(it)) } }
    val user by container.account.user.collectAsStateWithLifecycle()
    val offlineOn = container.config.config.value?.offline?.enabled == true && user?.isFree == false
    Column(Modifier.fillMaxSize()) {
        TopBar("Create a test", actions = { if (offlineOn) LinkButton("Downloads", { nav.navigate(R.DOWNLOADS) }) })
        PracticeContent(
            state,
            onRetry = vm::retry, onBank = vm::pickBank, onSelect = vm::select, onTutor = vm::setTutor, onTimed = vm::setTimed,
            onFilter = vm::toggleFilter, onCount = vm::setCount, onStart = vm::start,
            onResume = { nav.navigate(R.player(it)) },
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun PracticeContent(
    state: PracticeState,
    onRetry: () -> Unit,
    onBank: (String) -> Unit,
    onSelect: (Selection) -> Unit,
    onTutor: (Boolean) -> Unit,
    onTimed: (Boolean) -> Unit,
    onFilter: (Filter) -> Unit,
    onCount: (Int) -> Unit,
    onStart: () -> Unit,
    onResume: (String) -> Unit,
) {
    val c = Ex.c
    val bank = state.bank
    when {
        state.error != null && bank == null -> { ErrorState(state.error, onRetry); return }
        bank == null -> { Loading(); return }
    }
    Box(Modifier.fillMaxSize()) {
        Column(
            Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(start = 16.dp, end = 16.dp, top = 4.dp, bottom = 120.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            BankChips(state.banks, state.bankId, onBank)
            Panel {
                Text("Mode", style = MaterialTheme.typography.titleMedium, color = c.ink)
                Toggle("Tutor", "See the answer and explanation after each question", state.tutor, onTutor)
                Toggle("Timed", "Answer against a clock", state.timed, onTimed)
            }
            Panel {
                Text("Questions from", style = MaterialTheme.typography.titleMedium, color = c.ink)
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Filter.entries.forEach { f ->
                        val n = state.pool?.count(f)
                        Chip("${f.label} ${n?.toString() ?: "…"}", f in state.filters, { onFilter(f) })
                    }
                }
                Text(if (state.filters.isEmpty()) "None picked means every question." else "", style = MaterialTheme.typography.bodySmall, color = c.muted)
            }
            Text("Subjects and chapters", style = MaterialTheme.typography.titleMedium, color = c.ink)
            if (state.catalog == null && state.loading) Loading(Modifier.height(120.dp))
            else ChapterPicker(bank!!, state.catalog, state.sel, state.paid, onSelect)
            if (!state.paid && state.catalog != null) {
                val n = state.catalog.counts(state.sel.subjects, state.sel.chapters)
                if (n.open < n.total) PassLine()
            }
            Panel {
                Text("Number of questions", style = MaterialTheme.typography.titleMedium, color = c.ink)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { COUNTS.forEach { n -> Chip("$n", state.count == n, { onCount(n) }) } }
            }
            state.startError?.let {
                Note(it, if (state.needsPass) "warn" else "bad")
                if (state.needsPass) PassLine()
                state.openTest?.let { id -> PillButton("Resume that test", { onResume(id) }, dark = false, modifier = Modifier.fillMaxWidth()) }
            }
        }
        // The Start bar stays at the bottom.
        Row(
            Modifier.align(Alignment.BottomCenter).fillMaxWidth().background(c.card).padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f)) {
                Text(state.sel.summary(), style = MaterialTheme.typography.bodySmall, color = c.muted, maxLines = 1)
                Text(if (state.match == 0) "Nothing matches" else "${state.starts} question${if (state.starts == 1) "" else "s"}", style = MaterialTheme.typography.titleMedium, color = c.ink)
            }
            Spacer(Modifier.padding(4.dp))
            PillButton("Start", onStart, enabled = state.match > 0, busy = state.starting)
        }
    }
}

@Composable
private fun Toggle(title: String, text: String, on: Boolean, onChange: (Boolean) -> Unit) {
    val c = Ex.c
    Row(verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.bodyLarge, color = c.ink)
            Text(text, style = MaterialTheme.typography.bodySmall, color = c.muted)
        }
        Switch(on, onChange, colors = SwitchDefaults.colors(checkedTrackColor = c.blue))
    }
}
