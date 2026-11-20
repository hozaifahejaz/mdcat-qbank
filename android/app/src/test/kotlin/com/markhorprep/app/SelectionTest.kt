package com.markhorprep.app

import org.junit.Assert.assertEquals
import org.junit.Test
import com.markhorprep.app.ui.practice.Selection
import com.markhorprep.app.ui.practice.counts

class SelectionTest {
    private val bank = Samples.banks.first { it.id == "mdcat" }

    @Test fun chaptersCollapseToTheWholeBook() {
        var s: Selection = Selection.None
        s = s.toggleChapter(bank, "Chemistry", "Atomic structure")
        assertEquals(Selection.Chapters("Chemistry", setOf("Atomic structure")), s)
        s = s.toggleChapter(bank, "Chemistry", "Chemical bonding")
        assertEquals(Selection.Subjects(setOf("Chemistry")), s)
        assertEquals("Chemistry", s.summary())
    }

    @Test fun freeCountsUseOpenQuestions() {
        val n = Samples.catalog.counts(listOf("Biology"))
        assertEquals(30, n.open)
        assertEquals(270, n.total)
        assertEquals(14, n.answered)
    }
}
