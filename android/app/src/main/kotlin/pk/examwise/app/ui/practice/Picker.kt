package pk.examwise.app.ui.practice

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TriStateCheckbox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.state.ToggleableState
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.size
import pk.examwise.app.ui.components.Chip
import pk.examwise.app.ui.components.Divider
import pk.examwise.app.ui.components.Panel
import pk.examwise.app.ui.theme.Ex
import pk.examwise.core.model.Bank
import pk.examwise.core.model.Catalog

/* What the student picked, as on the website: some whole subjects, or some chapters of one subject. */
sealed interface Selection {
    data class Subjects(val set: Set<String>) : Selection
    data class Chapters(val subject: String, val set: Set<String>) : Selection

    val subjects: List<String> get() = when (this) { is Subjects -> set.toList(); is Chapters -> listOf(subject) }
    val chapters: List<String> get() = when (this) { is Subjects -> emptyList(); is Chapters -> set.toList() }

    fun toggleSubject(s: String): Selection {
        val set = (this as? Subjects)?.set ?: emptySet()
        return Subjects(if (s in set) set - s else set + s)
    }

    fun toggleChapter(bank: Bank, s: String, c: String): Selection {
        val cur = (this as? Chapters)?.takeIf { it.subject == s }?.set ?: emptySet()
        val set = if (c in cur) cur - c else cur + c
        val all = bank.subjects.firstOrNull { it.name == s }?.chapters.orEmpty()
        // Every chapter ticked is the whole book; none ticked is nothing.
        return when {
            set.size == all.size -> Subjects(setOf(s))
            set.isEmpty() -> Subjects(emptySet())
            else -> Chapters(s, set)
        }
    }

    /* The words for the Start bar. */
    fun summary(noun: String = "subject"): String = when (this) {
        is Chapters -> "$subject · ${if (set.size == 1) set.first() else "${set.size} chapters"}"
        is Subjects -> when {
            set.isEmpty() -> "All ${noun}s"
            set.size <= 2 -> set.joinToString(" + ")
            else -> "${set.size} ${noun}s"
        }
    }

    companion object { val None: Selection = Subjects(emptySet()) }
}

/* Counts from the catalog for some subjects and chapters (lib/study.ts openCount and friends). */
data class Counts(val open: Int, val total: Int, val answered: Int, val correct: Int)

fun Catalog?.counts(subjects: List<String>, chapters: List<String> = emptyList()): Counts {
    val rows = this?.chapters.orEmpty().filter { (subjects.isEmpty() || it.subject in subjects) && (chapters.isEmpty() || it.chapter in chapters) }
    return Counts(rows.sumOf { it.open }, rows.sumOf { it.total }, rows.sumOf { it.answered }, rows.sumOf { it.correct })
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun BankChips(banks: List<Bank>, selected: String, onPick: (String) -> Unit) {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        banks.forEach { b -> Chip(b.short, b.id == selected, { onPick(b.id) }) }
    }
}

@Composable
fun ChapterPicker(bank: Bank, catalog: Catalog?, sel: Selection, paid: Boolean, onChange: (Selection) -> Unit) {
    val c = Ex.c
    var open by remember(bank.id) { mutableStateOf(setOf<String>()) }
    Panel(padding = 0.dp) {
        bank.subjects.forEachIndexed { i, s ->
            if (i > 0) Divider()
            val checked = sel is Selection.Subjects && s.name in sel.set
            val partial = sel is Selection.Chapters && sel.subject == s.name
            val expanded = s.name in open
            val n = catalog.counts(listOf(s.name))
            Row(Modifier.fillMaxWidth().clickable { onChange(sel.toggleSubject(s.name)) }.padding(start = 6.dp, end = 4.dp, top = 4.dp, bottom = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                TriStateCheckbox(
                    state = if (checked) ToggleableState.On else if (partial) ToggleableState.Indeterminate else ToggleableState.Off,
                    onClick = { onChange(sel.toggleSubject(s.name)) },
                    colors = CheckboxDefaults.colors(checkedColor = c.blue),
                )
                Column(Modifier.weight(1f)) {
                    Text(s.name, style = MaterialTheme.typography.titleMedium, color = c.ink)
                    val picked = if (partial) " · ${(sel as Selection.Chapters).set.size} picked" else ""
                    Text("${s.chapters.size} chapters$picked", style = MaterialTheme.typography.bodySmall, color = c.muted)
                }
                Score(n, paid)
                IconButton(onClick = { open = if (expanded) open - s.name else open + s.name }) {
                    Icon(if (expanded) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore, contentDescription = if (expanded) "Hide ${s.name} chapters" else "Show ${s.name} chapters", tint = c.muted)
                }
            }
            if (expanded) {
                s.chapters.forEachIndexed { k, ch ->
                    val on = checked || (partial && ch in (sel as Selection.Chapters).set)
                    Row(Modifier.fillMaxWidth().clickable { onChange(sel.toggleChapter(bank, s.name, ch)) }.padding(start = 30.dp, end = 52.dp), verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(on, onCheckedChange = { onChange(sel.toggleChapter(bank, s.name, ch)) }, colors = CheckboxDefaults.colors(checkedColor = c.blue))
                        Text("${k + 1}. $ch", Modifier.weight(1f).padding(vertical = 10.dp), style = MaterialTheme.typography.bodyMedium, color = c.ink)
                        Score(catalog.counts(listOf(s.name), listOf(ch)), paid)
                    }
                }
            }
        }
    }
}

/* Questions in a book or chapter. A free account sees how many are open to it, with a lock when some aren't. */
@Composable
private fun Score(n: Counts, paid: Boolean) {
    val c = Ex.c
    Row(verticalAlignment = Alignment.CenterVertically) {
        if (!paid && n.open < n.total) Icon(Icons.Filled.Lock, contentDescription = null, tint = c.muted, modifier = Modifier.padding(end = 4.dp).size(14.dp))
        Text(if (paid) "${n.total}" else "${n.open}", style = MaterialTheme.typography.labelMedium, color = c.muted, fontWeight = FontWeight.SemiBold)
    }
}
