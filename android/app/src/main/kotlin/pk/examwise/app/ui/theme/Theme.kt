package pk.examwise.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/* The website's colour tokens (app/globals.css), light and dark. */
@Immutable
data class ExColors(
    val bg: Color, val card: Color, val ink: Color, val muted: Color, val line: Color,
    val blue: Color, val blueSoft: Color, val pill: Color, val onPill: Color, val sky: Color,
    val good: Color, val warn: Color, val bad: Color, val dark: Boolean,
)

val LightColors = ExColors(
    bg = Color(0xFFF4F4F1), card = Color(0xFFFFFFFF), ink = Color(0xFF111214), muted = Color(0xFF64666D), line = Color(0xFFE6E6E1),
    blue = Color(0xFF2445FF), blueSoft = Color(0xFFE8ECFF), pill = Color(0xFF111214), onPill = Color(0xFFFFFFFF), sky = Color(0xFFDFF0FF),
    good = Color(0xFF11804A), warn = Color(0xFFB06A00), bad = Color(0xFFCC2F2F), dark = false,
)

val DarkColors = ExColors(
    bg = Color(0xFF0F1012), card = Color(0xFF18191C), ink = Color(0xFFF3F3F1), muted = Color(0xFF9A9CA3), line = Color(0xFF2A2B30),
    blue = Color(0xFF6F86FF), blueSoft = Color(0xFF1C2142), pill = Color(0xFFF3F3F1), onPill = Color(0xFF111214), sky = Color(0xFF152434),
    good = Color(0xFF48D08A), warn = Color(0xFFF0AA45), bad = Color(0xFFFF7272), dark = true,
)

val LocalEx = staticCompositionLocalOf { LightColors }

object Ex {
    val c: ExColors @Composable get() = LocalEx.current
}

/* Soft mixes like the site's color-mix(): a tint of [c] over the card colour. */
fun ExColors.tint(c: Color, amount: Float): Color = Color(
    red = card.red + (c.red - card.red) * amount,
    green = card.green + (c.green - card.green) * amount,
    blue = card.blue + (c.blue - card.blue) * amount,
)

private val type = Typography(
    headlineMedium = TextStyle(fontSize = 26.sp, lineHeight = 32.sp, fontWeight = FontWeight.Bold, letterSpacing = (-0.4).sp),
    headlineSmall = TextStyle(fontSize = 22.sp, lineHeight = 28.sp, fontWeight = FontWeight.Bold, letterSpacing = (-0.2).sp),
    titleLarge = TextStyle(fontSize = 19.sp, lineHeight = 25.sp, fontWeight = FontWeight.Bold),
    titleMedium = TextStyle(fontSize = 16.sp, lineHeight = 22.sp, fontWeight = FontWeight.SemiBold),
    bodyLarge = TextStyle(fontSize = 16.sp, lineHeight = 23.sp),
    bodyMedium = TextStyle(fontSize = 15.sp, lineHeight = 21.sp),
    bodySmall = TextStyle(fontSize = 13.sp, lineHeight = 18.sp),
    labelLarge = TextStyle(fontSize = 15.sp, lineHeight = 20.sp, fontWeight = FontWeight.Bold),
    labelMedium = TextStyle(fontSize = 13.sp, lineHeight = 18.sp, fontWeight = FontWeight.SemiBold),
    labelSmall = TextStyle(fontSize = 12.sp, lineHeight = 16.sp, fontWeight = FontWeight.Bold),
)

@Composable
fun ExamwiseTheme(dark: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    val c = if (dark) DarkColors else LightColors
    val scheme = if (dark) {
        darkColorScheme(primary = c.blue, onPrimary = c.onPill, background = c.bg, onBackground = c.ink, surface = c.card, onSurface = c.ink,
            surfaceVariant = c.bg, onSurfaceVariant = c.muted, outline = c.line, error = c.bad, secondaryContainer = c.blueSoft, onSecondaryContainer = c.ink,
            surfaceContainer = c.card, surfaceContainerHigh = c.card, surfaceContainerLow = c.card)
    } else {
        lightColorScheme(primary = c.blue, onPrimary = c.onPill, background = c.bg, onBackground = c.ink, surface = c.card, onSurface = c.ink,
            surfaceVariant = c.bg, onSurfaceVariant = c.muted, outline = c.line, error = c.bad, secondaryContainer = c.blueSoft, onSecondaryContainer = c.ink,
            surfaceContainer = c.card, surfaceContainerHigh = c.card, surfaceContainerLow = c.card)
    }
    CompositionLocalProvider(LocalEx provides c) {
        MaterialTheme(
            colorScheme = scheme,
            typography = type,
            shapes = Shapes(small = RoundedCornerShape(10.dp), medium = RoundedCornerShape(12.dp), large = RoundedCornerShape(18.dp)),
            content = content,
        )
    }
}
