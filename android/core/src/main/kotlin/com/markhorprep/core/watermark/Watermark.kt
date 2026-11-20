package com.markhorprep.core.watermark

/* The coded watermark, ported from lib/watermark.ts: the account's 8-character short ID written as a 10 × 10 grid
   that repeats across the screen. Row 0 and column 0 are a fixed sync pattern; the other 81 cells hold the 32-bit
   ID twice and a CRC-16/CCITT checksum, with one spare. Must match the website cell for cell so /admin/reveal can
   read phone screenshots too. */
object Watermark {
    const val CELL_DP = 16
    const val GRID = 10
    const val TILE_DP = CELL_DP * GRID

    private val SYNC_ROW = intArrayOf(1, 1, 1, 0, 1, 0, 0, 1, 1, 0)
    private val SYNC_COL = intArrayOf(1, 0, 0, 1, 1, 0, 1, 0, 1)

    /* First 8 hex digits of the account ID, upper case, padded with zeros. */
    fun shortId(userId: String): String = userId.replace("-", "").take(8).uppercase().padEnd(8, '0')

    fun crc16(bytes: IntArray): Int {
        var c = 0xffff
        for (b in bytes) {
            c = c xor (b shl 8)
            repeat(8) { c = if (c and 0x8000 != 0) ((c shl 1) xor 0x1021) and 0xffff else (c shl 1) and 0xffff }
        }
        return c
    }

    private fun idBytes(id: String) = intArrayOf(0, 2, 4, 6).map { i ->
        id.substring(i, minOf(id.length, i + 2)).toIntOrNull(16) ?: 0
    }.toIntArray()

    private fun toBits(bytes: IntArray): List<Int> = bytes.flatMap { b -> (7 downTo 0).map { k -> (b shr k) and 1 } }

    /* Data cells in order: ID copy one (32), checksum (16), ID copy two (32), spare. */
    fun payload(id: String): List<Int> {
        val bytes = idBytes(id)
        val crc = crc16(bytes)
        val idBits = toBits(bytes)
        return idBits + toBits(intArrayOf(crc shr 8, crc and 0xff)) + idBits + 0
    }

    /* GRID × GRID cells, row-major: 1 = shifted block. Takes the short ID. */
    fun encode(id: String): IntArray {
        val data = payload(id)
        var d = 0
        return IntArray(GRID * GRID) { i ->
            val r = i / GRID
            val c = i % GRID
            when {
                r == 0 -> SYNC_ROW[c]
                c == 0 -> SYNC_COL[r - 1]
                else -> data[d++]
            }
        }
    }
}
