package pk.examwise.app.ui.review

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import pk.examwise.app.AppContainer
import pk.examwise.app.ui.R
import pk.examwise.app.ui.components.Chip
import pk.examwise.app.ui.components.EmptyState
import pk.examwise.app.ui.components.ErrorState
import pk.examwise.app.ui.components.Loading
import pk.examwise.app.ui.components.Note
import pk.examwise.app.ui.components.Panel
import pk.examwise.app.ui.components.TopBar
import pk.examwise.app.ui.components.pct
import pk.examwise.app.ui.player.AnsweredOptions
import pk.examwise.app.ui.player.Explanation
import pk.examwise.app.ui.player.ResultStrip
import pk.examwise.app.ui.player.Stem
import pk.examwise.app.ui.player.spent
import pk.examwise.app.ui.player.textSize
import pk.examwise.app.ui.rememberLoad
import pk.examwise.app.ui.theme.Ex
import pk.examwise.app.ui.watermark.Watermarked
import pk.examwise.core.model.FullQuestion
import pk.examwise.core.model.Stats

/* One reviewed question, from the server or from an offline session. */
data class RItem(val q: FullQuestion, val chosen: Int?, val flagged: Boolean = false, val seconds: Int? = null, val stats: Stats? = null)

data class ReviewData(val title: String, val score: Int, val total: Int, val seconds: Int?, val withdrawn: Int, val items: List<RItem>, val note: String? = null)

@Composable
fun ReviewScreen(container: AppContainer, nav: NavHostController, id: String) {
    val vm = rememberLoad("review:$id") {
        val r = container.study.review(id)
        ReviewData(
            r.attempt.title, r.attempt.score, r.attempt.total, r.attempt.seconds ?: (r.attempt.minutes * 60), r.withdrawn,
            r.items.map { RItem(it.q, it.chosen, it.flagged, it.seconds, it.stats) },
        )
    }
    val state by vm.state.collectAsStateWithLifecycle()
    ReviewFrame(container, nav, state.data, state.error, vm::refresh)
}

@Composable
fun LocalReviewScreen(container: AppContainer, nav: NavHostController, sessionId: String) {
    val vm = rememberLoad("local:$sessionId") {
        val (s, items) = container.offline.localReview(sessionId) ?: throw pk.examwise.core.api.ApiError(404, "gone", "This session isn't on your phone any more.")
        ReviewData(
            "Offline · ${s.title}", items.count { it.chosen == it.q.answer }, items.size, items.sumOf { it.seconds ?: 0 }, 0,
            items.map { RItem(it.q, it.chosen, seconds = it.seconds) },
            note = if (!s.synced) "These answers go to your progress once you're back online." else null,
        )
    }
    val state by vm.state.collectAsStateWithLifecycle()
    ReviewFrame(container, nav, state.data, state.error, vm::refresh)
}

@Composable
private fun ReviewFrame(container: AppContainer, nav: NavHostController, data: ReviewData?, error: String?, retry: () -> Unit) {
    val user by container.account.user.collectAsStateWithLifecycle()
    val size by container.prefs.textSize.collectAsState(initial = 0)
    Column(Modifier.fillMaxSize()) {
        TopBar("Review", onBack = { if (!nav.popBackStack(R.HOME, false)) nav.popBackStack() })
        Watermarked(user?.id) {
            when {
                data != null -> ReviewContent(data, size)
                error != null -> ErrorState(error, retry)
                else -> Loading()
            }
        }
    }
}

@Composable
fun ReviewContent(data: ReviewData, size: Int) {
    val c = Ex.c
    var filter by remember { mutableStateOf("all") }
    val shown = data.items.withIndex().filter { (_, it) ->
        when (filter) {
            "wrong" -> it.chosen != it.q.answer
            "flagged" -> it.flagged
            else -> true
        }
    }
    LazyColumn(Modifier.fillMaxSize().background(c.bg), contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Panel {
                Text(data.title, style = MaterialTheme.typography.bodyMedium, color = c.muted)
                Row(verticalAlignment = Alignment.Bottom) {
                    Text("${data.score}/${data.total}", style = MaterialTheme.typography.headlineMedium, color = c.ink, modifier = Modifier.weight(1f))
                    Text("${pct(data.score, data.total)}%", style = MaterialTheme.typography.titleLarge, color = c.ink)
                }
                data.seconds?.takeIf { it > 0 }?.let { Text("Time ${spent(it)}", style = MaterialTheme.typography.bodySmall, color = c.muted) }
                if (data.withdrawn > 0) Text(
                    "${data.withdrawn} question${if (data.withdrawn == 1) " was" else "s were"} withdrawn after review and ${if (data.withdrawn == 1) "isn't" else "aren't"} counted.",
                    style = MaterialTheme.typography.bodySmall, color = c.muted,
                )
                data.note?.let { Note(it) }
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Chip("All", filter == "all", { filter = "all" })
                Chip("Wrong", filter == "wrong", { filter = "wrong" })
                Chip("Flagged", filter == "flagged", { filter = "flagged" })
            }
        }
        if (shown.isEmpty()) item { EmptyState("Nothing here", if (filter == "wrong") "You got every question right." else "No questions match.") }
        itemsIndexed(shown, key = { _, it -> it.index }) { _, (i, it) ->
            Panel {
                Text("QUESTION ${i + 1}", style = MaterialTheme.typography.labelSmall, color = c.muted)
                Stem(it.q.stem, textSize(size))
                AnsweredOptions(it.q, it.chosen, it.stats, textSize(size))
                ResultStrip(it.q, it.chosen, it.stats, it.seconds)
                Explanation(it.q, it.chosen, textSize(size))
            }
        }
    }
}

@Composable
fun ReviewList(questions: List<RItem>, size: Int, header: @Composable () -> Unit = {}) {
    val c = Ex.c
    LazyColumn(Modifier.fillMaxSize().background(c.bg), contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { header() }
        itemsIndexed(questions, key = { _, it -> it.q.id }) { _, it ->
            Panel {
                Stem(it.q.stem, textSize(size))
                AnsweredOptions(it.q, it.chosen, it.stats, textSize(size))
                Explanation(it.q, it.chosen, textSize(size))
            }
        }
    }
}
