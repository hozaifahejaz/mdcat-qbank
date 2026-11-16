package pk.examwise.app.ui.watermark

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import pk.examwise.app.ui.theme.Ex
import pk.examwise.core.watermark.Watermark

/* Draws the account's coded grid (core/watermark, same as the website's) over [content], repeated across the whole
   screen. It takes no touches. Light theme: black at 0.6%; dark theme: white at 1%, the same 1 to 2 brightness
   levels the website's blend gives. */
const val WM_LIGHT_ALPHA = 0.006f
const val WM_DARK_ALPHA = 0.010f

@Composable
fun Watermarked(userId: String?, content: @Composable () -> Unit) {
    Box(Modifier.fillMaxSize()) {
        content()
        if (userId != null) WatermarkLayer(userId)
    }
}

@Composable
fun WatermarkLayer(userId: String) {
    val cells = remember(userId) { Watermark.encode(Watermark.shortId(userId)) }
    val dark = Ex.c.dark
    val color = if (dark) Color.White.copy(alpha = WM_DARK_ALPHA) else Color.Black.copy(alpha = WM_LIGHT_ALPHA)
    val cellPx = with(LocalDensity.current) { Watermark.CELL_DP.dp.toPx() }
    Canvas(Modifier.fillMaxSize()) {
        val tile = cellPx * Watermark.GRID
        var ty = 0f
        while (ty < size.height) {
            var tx = 0f
            while (tx < size.width) {
                for (i in cells.indices) {
                    if (cells[i] == 0) continue
                    val x = tx + (i % Watermark.GRID) * cellPx
                    val y = ty + (i / Watermark.GRID) * cellPx
                    drawRect(color, Offset(x, y), Size(cellPx, cellPx))
                }
                tx += tile
            }
            ty += tile
        }
    }
}
