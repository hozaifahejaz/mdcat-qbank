package com.markhorprep.app.data

import kotlinx.serialization.KSerializer
import com.markhorprep.app.data.db.CacheEntry
import com.markhorprep.core.api.MarkhorPrepApi

/* The last good copy of lists the student opens often (account, config, banks, catalog, dashboard, history), so a
   screen can draw at once and refresh behind. Question content is never kept here. */
class Cache(private val db: suspend () -> com.markhorprep.app.data.db.AppDatabase) {
    suspend fun <T> get(key: String, serializer: KSerializer<T>): T? = runCatching {
        db().cache().get(key)?.let { MarkhorPrepApi.json.decodeFromString(serializer, it.json) }
    }.getOrNull()

    suspend fun <T> put(key: String, serializer: KSerializer<T>, value: T) {
        runCatching { db().cache().put(CacheEntry(key, MarkhorPrepApi.json.encodeToString(serializer, value), System.currentTimeMillis())) }
    }

    suspend fun clear() { runCatching { db().cache().clear() } }
}
