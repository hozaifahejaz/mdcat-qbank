package pk.examwise.app.data

import kotlinx.serialization.KSerializer
import pk.examwise.app.data.db.CacheEntry
import pk.examwise.core.api.ExamwiseApi

/* The last good copy of lists the student opens often (account, config, banks, catalog, dashboard, history), so a
   screen can draw at once and refresh behind. Question content is never kept here. */
class Cache(private val db: suspend () -> pk.examwise.app.data.db.AppDatabase) {
    suspend fun <T> get(key: String, serializer: KSerializer<T>): T? = runCatching {
        db().cache().get(key)?.let { ExamwiseApi.json.decodeFromString(serializer, it.json) }
    }.getOrNull()

    suspend fun <T> put(key: String, serializer: KSerializer<T>, value: T) {
        runCatching { db().cache().put(CacheEntry(key, ExamwiseApi.json.encodeToString(serializer, value), System.currentTimeMillis())) }
    }

    suspend fun clear() { runCatching { db().cache().clear() } }
}
