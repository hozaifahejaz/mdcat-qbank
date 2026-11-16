package pk.examwise.app

import pk.examwise.core.model.Bank
import pk.examwise.core.model.BankSubject
import pk.examwise.core.model.Catalog
import pk.examwise.core.model.ChapterCount
import pk.examwise.core.model.ChapterStat
import pk.examwise.core.model.Dashboard
import pk.examwise.core.model.DayActivity
import pk.examwise.core.model.FullQuestion
import pk.examwise.core.model.PastPaper
import pk.examwise.core.model.Pool
import pk.examwise.core.model.Resume
import pk.examwise.core.model.Stats
import pk.examwise.core.model.SubjectStat
import pk.examwise.core.model.TestResult
import pk.examwise.core.model.WeakTopic

/* Made-up data for screenshot and view model tests. Not real questions. */
object Samples {
    val banks = listOf(
        Bank("fsc1", "FSc Part 1", "FSc 1", "Punjab textbooks, first year", listOf(BankSubject("Biology", listOf("Cell", "Enzymes")), BankSubject("Chemistry", listOf("Atoms", "Bonds")))),
        Bank("fsc2", "FSc Part 2", "FSc 2", "Punjab textbooks, second year"),
        Bank("mdcat", "MDCAT", "MDCAT", "The PMDC syllabus", listOf(
            BankSubject("Biology", listOf("Cell structure", "Biological molecules", "Enzymes")),
            BankSubject("Chemistry", listOf("Atomic structure", "Chemical bonding")),
            BankSubject("Physics", listOf("Vectors", "Motion")),
        )),
        Bank("nums", "NUMS MDCAT", "NUMS", "The NUMS syllabus"),
        Bank("aku", "AKU Admission Test", "AKU", "The AKU syllabus"),
    )

    val catalog = Catalog(
        paid = false, bank = "mdcat",
        chapters = listOf(
            ChapterCount("Biology", "Cell structure", 120, 20, 14, 10),
            ChapterCount("Biology", "Biological molecules", 90, 10, 0, 0),
            ChapterCount("Biology", "Enzymes", 60, 0, 0, 0),
            ChapterCount("Chemistry", "Atomic structure", 80, 20, 5, 3),
            ChapterCount("Chemistry", "Chemical bonding", 70, 10, 0, 0),
            ChapterCount("Physics", "Vectors", 50, 20, 9, 8),
            ChapterCount("Physics", "Motion", 40, 20, 0, 0),
        ),
        papers = listOf(PastPaper(2026, 180), PastPaper(2025, 180)),
        mocks = 12, mockReady = true, miniReady = true, miniUsed = false,
    )

    val pool = Pool(total = 510, unused = 480, incorrect = 8, marked = 3, omitted = 2, correct = 20, markedIn = mapOf("unused" to 1, "incorrect" to 2))

    val dashboard = Dashboard(
        bank = "mdcat", welcomed = true, answeredEver = 320, streakDays = 4, dailyGoal = 50,
        daily = (0 until 84).map { i -> val n = if (i % 3 == 0) 0 else (i * 7) % 60; DayActivity("2026-${if (i < 60) "09" else "10"}-${(i % 28 + 1).toString().padStart(2, '0')}", n, n * 2 / 3) }.mapIndexed { i, d -> d.copy(date = java.time.LocalDate.of(2026, 8, 25).plusDays(i.toLong()).toString()) },
        bookmarks = 6, mistakesToRetry = 11, nextMock = "mini",
        resume = Resume("Chemistry · 25 questions", 9, 25, "/test?id=abc"),
        subjects = listOf(
            SubjectStat("Biology", listOf(ChapterStat("Cell structure", 40, 120, 31), ChapterStat("Enzymes", 12, 60, 7))),
            SubjectStat("Chemistry", listOf(ChapterStat("Atomic structure", 30, 80, 21))),
            SubjectStat("Physics", listOf(ChapterStat("Vectors", 0, 50, 0))),
        ),
        weakTopics = listOf(WeakTopic("Biology", "Enzymes", "Inhibition", 8, 3)),
        recent = emptyList(),
    )

    val history = listOf(
        TestResult("t1", "mini-mock", "Mini mock", "2026-11-10T10:00:00Z", 21, 30, 28),
        TestResult("t2", "practice", "Chemistry", "2026-11-12T10:00:00Z", 8, 10, 9),
    )

    val question = FullQuestion(
        id = "SAMPLE-1", subject = "Chemistry", chapter = "Atomic structure", topic = "Quantum numbers", difficulty = "moderate",
        source = "Sample reference, chapter 2",
        stem = "Which set of quantum numbers is not allowed for an electron?",
        options = listOf("n = 2, l = 1, m = 0", "n = 3, l = 2, m = -2", "n = 2, l = 2, m = 1", "n = 1, l = 0, m = 0"),
        answer = 2,
        why = "l can only take values from 0 to n − 1, so l = 2 is impossible when n = 2.",
        wrong = mapOf("0" to "Allowed: l = 1 is below n = 2 and m lies between −l and +l.", "1" to "Allowed: l = 2 is below n = 3.", "3" to "Allowed: the ground state of hydrogen."),
    )
    val stats = Stats(40, listOf(6, 5, 26, 3))
}
