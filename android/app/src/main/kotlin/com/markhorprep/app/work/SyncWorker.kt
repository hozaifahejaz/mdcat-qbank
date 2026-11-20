package com.markhorprep.app.work

import android.content.Context
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.markhorprep.app.MarkhorPrepApp
import com.markhorprep.core.api.ApiError
import java.util.concurrent.TimeUnit

/* Sends finished offline sessions once there is a connection. Queued when a session finishes and at start-up. */
class SyncWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val c = (applicationContext as MarkhorPrepApp).container
        if (!c.account.hasSession()) return Result.success()
        return try {
            if (c.offline.sync() > 0) runCatching { c.study.dashboard() }
            Result.success()
        } catch (e: ApiError) {
            when {
                // Signed out: the rows wait for the next sign-in to the same account.
                e.status == 401 || e.status == 423 -> Result.success()
                e.isOffline || e.status >= 500 || e.status == 429 -> Result.retry()
                else -> Result.failure()
            }
        }
    }

    companion object {
        fun queue(context: Context) {
            val req = OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
                .build()
            WorkManager.getInstance(context).enqueueUniqueWork("offline-sync", ExistingWorkPolicy.REPLACE, req)
        }
    }
}
