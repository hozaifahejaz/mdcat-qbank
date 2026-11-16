package pk.examwise.app.data.db

import android.content.Context
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.Transaction
import androidx.room.Upsert
import kotlinx.coroutines.flow.Flow
import net.zetetic.database.sqlcipher.SupportOpenHelperFactory
import pk.examwise.app.data.Prefs
import pk.examwise.app.data.SecureBox
import java.security.SecureRandom

/* Everything the app keeps, in one database encrypted with SQLCipher. Its passphrase is 32 random bytes, sealed by
   the Keystore key. If the passphrase can't be opened (say, after a restore to another phone), the database is
   deleted and started empty. */

@Entity(tableName = "cache")
data class CacheEntry(@PrimaryKey val key: String, val json: String, val savedAt: Long)

@Entity(tableName = "outbox")
data class OutboxEntry(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val kind: String,
    val path: String,
    val json: String,
    val createdAt: Long,
    val tries: Int = 0,
)

@Entity(tableName = "pack")
data class PackEntity(
    @PrimaryKey val id: String,
    val title: String,
    val questionCount: Int,
    val expiresAt: Long,
    val downloadedAt: Long,
)

@Entity(tableName = "pack_question", primaryKeys = ["packId", "questionId"])
data class PackQuestionEntity(
    val packId: String,
    val questionId: String,
    val position: Int,
    val json: String,
    val answered: Boolean = false,
)

@Entity(tableName = "offline_session")
data class OfflineSessionEntity(
    @PrimaryKey val id: String,
    val packId: String,
    val title: String,
    /* The questions in the order they were served, as a JSON list of IDs. */
    val questionIds: String,
    val startedAt: Long,
    val finishedAt: Long? = null,
    val synced: Boolean = false,
)

@Entity(tableName = "offline_answer", primaryKeys = ["sessionId", "idx"])
data class OfflineAnswerEntity(
    val sessionId: String,
    val idx: Int,
    val questionId: String,
    val answer: Int,
    val seconds: Int?,
    val at: Long,
)

data class PackSummary(val id: String, val title: String, val questionCount: Int, val expiresAt: Long, val answered: Int)

@Dao
interface CacheDao {
    @Query("SELECT * FROM cache WHERE `key` = :key")
    suspend fun get(key: String): CacheEntry?

    @Upsert
    suspend fun put(e: CacheEntry)

    @Query("DELETE FROM cache")
    suspend fun clear()
}

@Dao
interface OutboxDao {
    @Insert
    suspend fun add(e: OutboxEntry): Long

    @Query("SELECT * FROM outbox ORDER BY id LIMIT 1")
    suspend fun first(): OutboxEntry?

    @Query("SELECT count(*) FROM outbox")
    fun count(): Flow<Int>

    @Query("SELECT count(*) FROM outbox")
    suspend fun size(): Int

    @Query("DELETE FROM outbox WHERE id = :id")
    suspend fun remove(id: Long)

    @Query("UPDATE outbox SET tries = tries + 1 WHERE id = :id")
    suspend fun tried(id: Long)

    @Query("DELETE FROM outbox")
    suspend fun clear()
}

@Dao
interface OfflineDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPack(p: PackEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuestions(q: List<PackQuestionEntity>)

    @Transaction
    suspend fun savePack(p: PackEntity, q: List<PackQuestionEntity>) {
        insertPack(p)
        insertQuestions(q)
    }

    @Query(
        """SELECT p.id, p.title, p.questionCount, p.expiresAt,
           (SELECT count(*) FROM pack_question q WHERE q.packId = p.id AND q.answered) AS answered
           FROM pack p ORDER BY p.downloadedAt DESC""",
    )
    fun packs(): Flow<List<PackSummary>>

    @Query("SELECT * FROM pack")
    suspend fun allPacks(): List<PackEntity>

    @Query("SELECT * FROM pack WHERE id = :id")
    suspend fun pack(id: String): PackEntity?

    @Query("SELECT coalesce(sum(questionCount), 0) FROM pack")
    suspend fun held(): Int

    @Query("UPDATE pack SET expiresAt = :expiresAt WHERE id = :id")
    suspend fun setExpiry(id: String, expiresAt: Long)

    @Query("SELECT * FROM pack_question WHERE packId = :packId ORDER BY position")
    suspend fun questions(packId: String): List<PackQuestionEntity>

    @Query("SELECT * FROM pack_question WHERE packId = :packId AND questionId IN (:ids)")
    suspend fun questionsById(packId: String, ids: List<String>): List<PackQuestionEntity>

    @Query("UPDATE pack_question SET answered = 1 WHERE packId = :packId AND questionId = :questionId")
    suspend fun markAnswered(packId: String, questionId: String)

    @Query("DELETE FROM pack_question WHERE packId = :id")
    suspend fun deleteQuestions(id: String)

    @Query("DELETE FROM pack WHERE id = :id")
    suspend fun deletePackRow(id: String)

    @Transaction
    suspend fun deletePack(id: String) {
        deleteQuestions(id)
        deletePackRow(id)
    }

    @Query("DELETE FROM pack_question")
    suspend fun clearQuestions()

    @Query("DELETE FROM pack")
    suspend fun clearPackRows()

    @Transaction
    suspend fun wipePacks() {
        clearQuestions()
        clearPackRows()
    }

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertSession(s: OfflineSessionEntity)

    @Query("SELECT * FROM offline_session WHERE id = :id")
    suspend fun session(id: String): OfflineSessionEntity?

    @Query("SELECT * FROM offline_session WHERE finishedAt IS NOT NULL AND NOT synced ORDER BY startedAt LIMIT :limit")
    suspend fun unsynced(limit: Int): List<OfflineSessionEntity>

    @Query("SELECT count(*) FROM offline_session WHERE finishedAt IS NOT NULL AND NOT synced")
    suspend fun unsyncedCount(): Int

    @Query("SELECT * FROM offline_session WHERE finishedAt IS NOT NULL ORDER BY startedAt DESC")
    fun finishedSessions(): Flow<List<OfflineSessionEntity>>

    @Query("UPDATE offline_session SET synced = 1 WHERE id IN (:ids)")
    suspend fun markSynced(ids: List<String>)

    @Query("DELETE FROM offline_answer WHERE sessionId IN (SELECT id FROM offline_session WHERE synced AND finishedAt < :before)")
    suspend fun dropOldAnswers(before: Long)

    @Query("DELETE FROM offline_session WHERE synced AND finishedAt < :before")
    suspend fun dropOldSessionRows(before: Long)

    @Transaction
    suspend fun dropOldSessions(before: Long) {
        dropOldAnswers(before)
        dropOldSessionRows(before)
    }

    @Query("DELETE FROM offline_answer WHERE sessionId = :id")
    suspend fun deleteAnswers(id: String)

    @Query("DELETE FROM offline_session WHERE id = :id")
    suspend fun deleteSessionRow(id: String)

    @Transaction
    suspend fun deleteSession(id: String) {
        deleteAnswers(id)
        deleteSessionRow(id)
    }

    @Query("DELETE FROM offline_answer")
    suspend fun clearAnswers()

    @Query("DELETE FROM offline_session")
    suspend fun clearSessions()

    @Transaction
    suspend fun wipeSessions() {
        clearAnswers()
        clearSessions()
    }

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun addAnswer(a: OfflineAnswerEntity)

    @Query("SELECT * FROM offline_answer WHERE sessionId = :id ORDER BY idx")
    suspend fun answers(id: String): List<OfflineAnswerEntity>
}

@Database(
    entities = [CacheEntry::class, OutboxEntry::class, PackEntity::class, PackQuestionEntity::class, OfflineSessionEntity::class, OfflineAnswerEntity::class],
    version = 1,
    exportSchema = true,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun cache(): CacheDao
    abstract fun outbox(): OutboxDao
    abstract fun offline(): OfflineDao

    companion object {
        private const val NAME = "examwise.db"

        suspend fun open(context: Context, prefs: Prefs): AppDatabase {
            System.loadLibrary("sqlcipher")
            val sealed = prefs.sealedDbPass()
            var pass = sealed?.let { SecureBox.decrypt(it) }
            if (pass == null) {
                // First run, or the passphrase can't be opened any more: start over with a new one.
                context.deleteDatabase(NAME)
                pass = ByteArray(32).also { SecureRandom().nextBytes(it) }
                prefs.setSealedDbPass(SecureBox.encrypt(pass))
            }
            return Room.databaseBuilder(context, AppDatabase::class.java, NAME)
                .openHelperFactory(SupportOpenHelperFactory(pass))
                .fallbackToDestructiveMigration(dropAllTables = true)
                .build()
        }

        /* For tests: an in-memory database without encryption. */
        fun inMemory(context: Context): AppDatabase =
            Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java).allowMainThreadQueries().build()
    }
}
