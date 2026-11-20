package com.markhorprep.app.ui.player

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.FormatSize
import androidx.compose.material.icons.outlined.Flag
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import com.markhorprep.app.AppContainer
import com.markhorprep.app.ui.R
import com.markhorprep.app.ui.components.ErrorState
import com.markhorprep.app.ui.components.Field
import com.markhorprep.app.ui.components.Loading
import com.markhorprep.app.ui.components.Note
import com.markhorprep.app.ui.components.PillButton
import com.markhorprep.app.ui.theme.Ex
import com.markhorprep.app.ui.theme.tint
import com.markhorprep.app.ui.watermark.Watermarked

val REPORT_REASONS = listOf(
    "The answer key is wrong", "More than one answer is correct", "The explanation is wrong or unclear", "Typo or formatting problem", "Something else",
)

@Composable
fun PlayerScreen(container: AppContainer, nav: NavHostController, id: String) {
    val vm: PlayerViewModel = viewModel(key = "player:$id") { PlayerViewModel(OnlineSource(container, id)) }
    Player(container, nav, vm)
}

@Composable
fun OfflinePlayerScreen(container: AppContainer, nav: NavHostController, packId: String) {
    val vm: PlayerViewModel = viewModel(key = "offline:$packId") { PlayerViewModel(OfflineSource(container, packId)) }
    Player(container, nav, vm)
}

@Composable
private fun Player(container: AppContainer, nav: NavHostController, vm: PlayerViewModel) {
    val state by vm.state.collectAsStateWithLifecycle()
    val size by container.prefs.textSize.collectAsState(initial = 0)
    val scope = rememberCoroutineScope()
    val user by container.account.user.collectAsStateWithLifecycle()

    LaunchedEffect(state.done) {
        when (val d = state.done) {
            is Done.Review -> nav.navigate(R.review(d.id)) { popUpTo(nav.currentDestination!!.route!!) { inclusive = true } }
            is Done.LocalReview -> nav.navigate(R.localReview(d.sessionId)) { popUpTo(nav.currentDestination!!.route!!) { inclusive = true } }
            Done.Back -> nav.popBackStack()
            null -> Unit
        }
    }

    var askLeave by remember { mutableStateOf(false) }
    val leave: () -> Unit = {
        if (state.offline) { vm.leave { nav.popBackStack() } } else { askLeave = true }
        Unit
    }
    BackHandler(enabled = state.done == null) { leave() }

    Watermarked(user?.id) {
        when {
            state.error != null -> Column(Modifier.fillMaxSize()) {
                PlayerTop("", state, null, size, onBack = { nav.popBackStack() }, onSize = {})
                ErrorState(state.error!!, onRetry = if (state.offline) null else vm::load)
            }
            state.loading || state.current == null -> Loading()
            else -> PlayerBody(
                state, size,
                secondsLeft = { vm.secondsLeft() },
                onBack = leave,
                onSize = { scope.launch { container.prefs.setTextSize((size + 1) % 3) } },
                vm = vm,
            )
        }
    }

    if (askLeave) AlertDialog(
        onDismissRequest = { askLeave = false },
        title = { Text("Leave this test?") },
        text = { Text("It stays open, so you can come back and finish it.") },
        confirmButton = { TextButton({ askLeave = false; nav.popBackStack() }) { Text("Leave") } },
        dismissButton = { TextButton({ askLeave = false }) { Text("Stay") } },
    )
}

@Composable
private fun PlayerTop(title: String, state: PlayerState, secondsLeft: (() -> Long?)?, size: Int, onBack: () -> Unit, onSize: () -> Unit) {
    val c = Ex.c
    Column(Modifier.background(c.card)) {
        Row(Modifier.fillMaxWidth().height(56.dp).padding(horizontal = 4.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Leave", tint = c.ink) }
            Column(Modifier.weight(1f)) {
                if (state.items.isNotEmpty()) Text("Question ${state.index + 1} of ${state.items.size}", style = MaterialTheme.typography.titleMedium, color = c.ink)
                Text(title, style = MaterialTheme.typography.bodySmall, color = c.muted, maxLines = 1)
            }
            if (secondsLeft != null && state.deadlineAt != null) Countdown(secondsLeft)
            IconButton(onClick = onSize) { Icon(Icons.Filled.FormatSize, contentDescription = "Text size ${size + 1} of 3", tint = c.ink) }
        }
        if (state.items.isNotEmpty()) {
            val done = if (state.tutor) state.items.count { it.checked } else state.answeredCount
            Box(Modifier.fillMaxWidth().height(3.dp).background(c.line)) {
                Box(Modifier.fillMaxWidth(done.toFloat() / state.items.size).height(3.dp).background(c.blue))
            }
        }
    }
}

@Composable
private fun Countdown(secondsLeft: () -> Long?) {
    var left by remember { mutableLongStateOf(secondsLeft() ?: 0) }
    LaunchedEffect(Unit) { while (true) { left = secondsLeft() ?: 0; delay(500) } }
    val c = Ex.c
    val h = left / 3600; val m = (left % 3600) / 60; val s = left % 60
    val text = if (h > 0) "%d:%02d:%02d".format(h, m, s) else "%d:%02d".format(m, s)
    Text(text, style = MaterialTheme.typography.titleMedium, color = if (left < 60) c.bad else c.ink, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp))
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlayerBody(state: PlayerState, size: Int, secondsLeft: () -> Long?, onBack: () -> Unit, onSize: () -> Unit, vm: PlayerViewModel?) {
    val c = Ex.c
    val cur = state.current!!
    val ts = textSize(size)
    var navigator by remember { mutableStateOf(false) }
    var reporting by remember { mutableStateOf(false) }
    var confirm by remember { mutableStateOf(false) }
    val last = state.index == state.items.lastIndex

    Column(Modifier.fillMaxSize().background(c.card)) {
        PlayerTop(state.title, state, secondsLeft, size, onBack, onSize)
        val scroll = rememberScrollState()
        LaunchedEffect(state.index) { scroll.scrollTo(0) }
        Column(Modifier.weight(1f).verticalScroll(scroll).padding(horizontal = 18.dp, vertical = 14.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            state.shortNote?.let { if (state.index == 0) Note(it) }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("QUESTION ${state.index + 1}", style = MaterialTheme.typography.labelSmall, color = c.muted, modifier = Modifier.weight(1f))
                IconButton(onClick = { vm?.flag() }) {
                    Icon(if (cur.flagged) Icons.Filled.Flag else Icons.Outlined.Flag, contentDescription = if (cur.flagged) "Unflag" else "Flag for review", tint = if (cur.flagged) c.warn else c.muted)
                }
                IconButton(onClick = { vm?.bookmark() }) {
                    Icon(if (cur.bookmarked) Icons.Filled.Bookmark else Icons.Filled.BookmarkBorder, contentDescription = if (cur.bookmarked) "Remove from saved" else "Save question", tint = if (cur.bookmarked) c.blue else c.muted)
                }
            }
            Stem(cur.q.stem, ts)
            val reveal = cur.reveal
            if (state.tutor && cur.checked && reveal != null) {
                AnsweredOptions(reveal, cur.answer, cur.stats, ts)
                ResultStrip(reveal, cur.answer, cur.stats, cur.seconds)
                Explanation(reveal, cur.answer, ts, onReport = { reporting = true })
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    cur.q.options.forEachIndexed { k, o ->
                        val selected = if (state.tutor) cur.picked == k else cur.answer == k
                        OptionRow(k, o, selected, k in state.crossed[cur.idx].orEmpty(), ts, enabled = !state.busy, onClick = { vm?.choose(k) }, onCross = { vm?.cross(k) })
                    }
                }
                if (state.tutor) PillButton("Submit", { vm?.check() }, enabled = cur.picked != null, busy = state.busy, modifier = Modifier.fillMaxWidth())
                else Text("Hold an option to cross it out.", style = MaterialTheme.typography.bodySmall, color = c.muted)
            }
            state.message?.let { Note(it, "warn") }
            Spacer(Modifier.height(12.dp))
        }
        // Bottom bar: Previous, the question list, Next (or Submit on the last question of a test).
        Row(Modifier.fillMaxWidth().background(c.card).padding(horizontal = 10.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = { vm?.prev() }, enabled = state.index > 0) { Text("Previous", style = MaterialTheme.typography.labelLarge, color = if (state.index > 0) c.ink else c.muted) }
            Box(Modifier.weight(1f), contentAlignment = Alignment.Center) {
                TextButton(onClick = { navigator = true }) { Text("${state.index + 1} / ${state.items.size}", style = MaterialTheme.typography.labelLarge, color = c.muted) }
            }
            when {
                !last -> PillButton("Next", { vm?.next() })
                state.tutor -> PillButton("Finish", { vm?.submit() }, busy = state.busy)
                else -> PillButton("Submit", { confirm = true }, busy = state.busy)
            }
        }
    }

    if (navigator) ModalBottomSheet(onDismissRequest = { navigator = false }, containerColor = c.card) {
        Navigator(state) { i -> navigator = false; vm?.go(i) }
    }
    if (reporting) ModalBottomSheet(onDismissRequest = { reporting = false }, containerColor = c.card) {
        ReportSheet { reason, note -> reporting = false; vm?.report(reason, note) }
    }
    if (confirm) AlertDialog(
        onDismissRequest = { confirm = false },
        title = { Text("Submit this test?") },
        text = { Text("You've answered ${state.answeredCount} of ${state.items.size}. You can't change answers after submitting.") },
        confirmButton = { TextButton({ confirm = false; vm?.submit() }) { Text("Submit") } },
        dismissButton = { TextButton({ confirm = false }) { Text("Keep going") } },
    )
}

/* One cell per question: answered, flagged, and in tutor mode right or wrong. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun Navigator(state: PlayerState, onPick: (Int) -> Unit) {
    val c = Ex.c
    Column(Modifier.padding(horizontal = 18.dp).padding(bottom = 28.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Questions", style = MaterialTheme.typography.titleLarge, color = c.ink)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            state.items.forEachIndexed { i, it ->
                val right = it.checked && it.reveal != null && it.answer == it.reveal.answer
                val wrong = it.checked && it.reveal != null && it.answer != it.reveal.answer
                val bg = when {
                    right -> c.tint(c.good, .18f)
                    wrong -> c.tint(c.bad, .16f)
                    it.answer != null -> c.blueSoft
                    else -> c.bg
                }
                Box(
                    Modifier.size(44.dp).clip(RoundedCornerShape(10.dp)).background(bg)
                        .then(if (i == state.index) Modifier.border(2.dp, c.ink, RoundedCornerShape(10.dp)) else Modifier)
                        .clickable { onPick(i) },
                    contentAlignment = Alignment.Center,
                ) {
                    Text("${i + 1}", style = MaterialTheme.typography.labelLarge, color = c.ink)
                    if (it.flagged) Icon(Icons.Filled.Flag, contentDescription = "Flagged", tint = c.warn, modifier = Modifier.align(Alignment.TopEnd).padding(2.dp).size(12.dp))
                }
            }
        }
        Text(
            if (state.tutor) "Green is right, red is wrong, blue is answered." else "Blue is answered. A flag marks questions to look at again.",
            style = MaterialTheme.typography.bodySmall, color = c.muted, textAlign = TextAlign.Start,
        )
    }
}

@Composable
private fun ReportSheet(onSend: (String, String) -> Unit) {
    val c = Ex.c
    var reason by remember { mutableStateOf<String?>(null) }
    var note by remember { mutableStateOf("") }
    Column(Modifier.padding(horizontal = 18.dp).padding(bottom = 28.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("Report a problem", style = MaterialTheme.typography.titleLarge, color = c.ink)
        REPORT_REASONS.forEach { r ->
            Row(Modifier.fillMaxWidth().selectable(reason == r, onClick = { reason = r }), verticalAlignment = Alignment.CenterVertically) {
                RadioButton(reason == r, onClick = { reason = r }, colors = RadioButtonDefaults.colors(selectedColor = c.blue))
                Text(r, style = MaterialTheme.typography.bodyLarge, color = c.ink)
            }
        }
        Field(note, { note = it.take(1000) }, "Anything else? (optional)")
        PillButton("Send", { onSend(reason!!, note) }, enabled = reason != null, modifier = Modifier.fillMaxWidth())
    }
}
