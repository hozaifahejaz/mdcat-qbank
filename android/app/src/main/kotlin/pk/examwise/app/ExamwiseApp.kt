package pk.examwise.app

import android.app.Application
import androidx.work.Configuration
import androidx.work.WorkManager

class ExamwiseApp : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
        WorkManager.initialize(this, Configuration.Builder().build())
    }
}
