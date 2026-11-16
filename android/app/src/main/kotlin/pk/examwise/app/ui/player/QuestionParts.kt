package pk.examwise.app.ui.player

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import pk.examwise.app.ui.components.LinkButton
import pk.examwise.app.ui.theme.Ex
import pk.examwise.app.ui.theme.tint
import pk.examwise.core.model.FullQuestion
import pk.examwise.core.model.Stats

val LETTERS = listOf("A", "B", "C", "D", "E")

/* Question text in three sizes, remembered on the phone. */
fun textSize(step: Int): TextUnit = when (step) { 1 -> 18.sp; 2 -> 20.sp; else -> 16.sp }

fun share(stats: Stats?, k: Int): Int? = if (stats != null && stats.n > 0) Math.round((stats.picks.getOrElse(k) { 0 } * 100f) / stats.n) else null

fun spent(seconds: Int): String = if (seconds < 60) "$seconds sec" else "${seconds / 60} min ${(seconds % 60).toString().padStart(2, '0')} sec"

@Composable
fun Stem(text: String, size: TextUnit) {
    // Plain text with its line breaks. Not selectable: question text is never copied out of the app.
    Text(text, style = MaterialTheme.typography.bodyLarge.copy(fontSize = size, lineHeight = size * 1.5f), color = Ex.c.ink)
}

/* One option before the answer is out: radio, letter, text. Long-press crosses it out (kept on the phone only). */
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun OptionRow(index: Int, text: String, selected: Boolean, crossed: Boolean, size: TextUnit, enabled: Boolean, onClick: () -> Unit, onCross: () -> Unit) {
    val c = Ex.c
    Row(
        Modifier.fillMaxWidth().heightIn(min = 48.dp).clip(RoundedCornerShape(10.dp))
            .background(if (selected) c.blueSoft else c.card)
            .combinedClickable(enabled = enabled, onClick = onClick, onLongClick = onCross)
            .padding(horizontal = 8.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Radio(selected, if (selected) c.blue else c.muted)
        Spacer(Modifier.width(10.dp))
        val style = MaterialTheme.typography.bodyLarge.copy(fontSize = size, lineHeight = size * 1.45f)
        Text(
            buildAnnotatedString {
                withStyle(SpanStyle(fontWeight = FontWeight.SemiBold)) { append("${LETTERS[index]}. ") }
                append(text)
            },
            style = style,
            color = if (crossed) c.muted else c.ink,
            textDecoration = if (crossed) TextDecoration.LineThrough else null,
        )
    }
}

@Composable
private fun Radio(on: Boolean, color: androidx.compose.ui.graphics.Color) {
    Box(Modifier.size(20.dp).border(2.dp, color, CircleShape), contentAlignment = Alignment.Center) {
        if (on) Box(Modifier.size(10.dp).clip(CircleShape).background(color))
    }
}

/* The options once the answer is out: a tick by the key, a cross by a wrong pick, and how many students chose each. */
@Composable
fun AnsweredOptions(q: FullQuestion, chosen: Int?, stats: Stats?, size: TextUnit) {
    val c = Ex.c
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        q.options.forEachIndexed { k, o ->
            val key = k == q.answer
            val mine = k == chosen
            val bg = if (key) c.tint(c.good, .11f) else if (mine) c.tint(c.bad, .09f) else c.card
            val markColor = if (key) c.good else c.bad
            Row(
                Modifier.fillMaxWidth().heightIn(min = 48.dp).clip(RoundedCornerShape(10.dp)).background(bg).padding(horizontal = 6.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(Modifier.width(20.dp)) {
                    if (key) Icon(Icons.Filled.Check, contentDescription = if (mine) "Your answer, correct" else "Correct answer", tint = markColor, modifier = Modifier.size(18.dp))
                    else if (mine) Icon(Icons.Filled.Close, contentDescription = "Your answer", tint = markColor, modifier = Modifier.size(18.dp))
                }
                Spacer(Modifier.width(6.dp))
                Radio(mine, if (mine) markColor else c.muted)
                Spacer(Modifier.width(10.dp))
                val p = share(stats, k)
                Text(
                    buildAnnotatedString {
                        withStyle(SpanStyle(fontWeight = FontWeight.SemiBold)) { append("${LETTERS[k]}. ") }
                        append(o)
                        if (p != null) withStyle(SpanStyle(color = c.muted)) { append(" ($p%)") }
                    },
                    style = MaterialTheme.typography.bodyLarge.copy(fontSize = size, lineHeight = size * 1.45f),
                    color = c.ink,
                )
            }
        }
    }
}

/* One line of result under the options: right or wrong, how other students did, and the time it took. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ResultStrip(q: FullQuestion, chosen: Int?, stats: Stats?, seconds: Int?) {
    val c = Ex.c
    val color = when { chosen == null -> c.warn; chosen == q.answer -> c.good; else -> c.bad }
    val verdict = when { chosen == null -> "Not answered"; chosen == q.answer -> "Correct"; else -> "Incorrect" }
    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(topEnd = 12.dp, bottomEnd = 12.dp, topStart = 4.dp, bottomStart = 4.dp)).background(c.bg)) {
        Box(Modifier.width(4.dp).heightIn(min = 56.dp).background(color))
        FlowRow(Modifier.padding(horizontal = 14.dp, vertical = 12.dp), horizontalArrangement = Arrangement.spacedBy(28.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Column {
                Text(verdict, style = MaterialTheme.typography.titleMedium, color = color)
                if (chosen != q.answer) Text("Correct answer ${LETTERS[q.answer]}", style = MaterialTheme.typography.bodySmall, color = c.muted)
            }
            share(stats, q.answer)?.let {
                Column {
                    Text("$it%", style = MaterialTheme.typography.titleMedium, color = c.ink)
                    Text("answered correctly", style = MaterialTheme.typography.bodySmall, color = c.muted)
                }
            }
            if (seconds != null && seconds > 0) Column {
                Text(spent(seconds), style = MaterialTheme.typography.titleMedium, color = c.ink)
                Text("time spent", style = MaterialTheme.typography.bodySmall, color = c.muted)
            }
        }
    }
}

/* Why the key is right, why each other option is wrong, then where it comes from in the book. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun Explanation(q: FullQuestion, chosen: Int?, size: TextUnit, onReport: (() -> Unit)? = null) {
    val c = Ex.c
    val body = MaterialTheme.typography.bodyLarge.copy(fontSize = size, lineHeight = size * 1.5f)
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Explanation", style = MaterialTheme.typography.titleMedium, color = c.ink)
        Text(buildAnnotatedString {
            withStyle(SpanStyle(fontWeight = FontWeight.Bold)) { append("${LETTERS[q.answer]} is correct. ") }
            append(q.why)
        }, style = body, color = c.ink)
        q.options.indices.filter { it != q.answer && q.wrongFor(it) != null }.forEach { i ->
            Text(buildAnnotatedString {
                withStyle(SpanStyle(fontWeight = FontWeight.Bold, color = if (i == chosen) c.bad else c.ink)) {
                    append("Choice ${LETTERS[i]}${if (i == chosen) " (your answer)" else ""}: ")
                }
                append(q.wrongFor(i)!!)
            }, style = body, color = c.ink)
        }
        if (q.source.isNotBlank()) Column {
            Text("Reference", style = MaterialTheme.typography.labelLarge, color = c.ink)
            Text(q.source, style = MaterialTheme.typography.bodyMedium, color = c.muted)
        }
        FlowRow(horizontalArrangement = Arrangement.spacedBy(28.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Tag("Subject", q.subject)
            if (q.chapter.isNotBlank()) Tag("Chapter", q.chapter)
            if (q.topic.isNotBlank()) Tag("Topic", q.topic)
            if (q.difficulty.isNotBlank()) Tag("Difficulty", q.difficulty.replaceFirstChar { it.uppercase() })
        }
        if (onReport != null) LinkButton("Report a problem with this question", onReport, color = c.muted)
    }
}

@Composable
private fun Tag(label: String, value: String) {
    Column {
        Text(value, style = MaterialTheme.typography.bodyMedium, color = Ex.c.ink, fontWeight = FontWeight.SemiBold)
        Text(label, style = MaterialTheme.typography.labelSmall, color = Ex.c.muted)
    }
}
