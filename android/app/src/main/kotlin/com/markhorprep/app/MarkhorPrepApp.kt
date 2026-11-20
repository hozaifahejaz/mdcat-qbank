package com.markhorprep.app

import android.app.Application
import androidx.work.Configuration
import androidx.work.WorkManager

class MarkhorPrepApp : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
        WorkManager.initialize(this, Configuration.Builder().build())
    }
}
