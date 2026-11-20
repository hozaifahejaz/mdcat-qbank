package pk.examwise.app.data

import android.content.Context
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import android.util.Log
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential

/* The phone's own Google account picker, through Credential Manager. Returns an ID token made out to the website's
   client ID, which the server checks (POST /api/auth/google/native). */
object GoogleSignIn {
    sealed interface Result {
        data class Token(val idToken: String) : Result
        data object Cancelled : Result
        data class Failed(val message: String) : Result
    }

    suspend fun pick(activityContext: Context, webClientId: String): Result {
        val option = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(false)
            .setServerClientId(webClientId)
            .setAutoSelectEnabled(false)
            .build()
        return try {
            val r = CredentialManager.create(activityContext).getCredential(activityContext, GetCredentialRequest(listOf(option)))
            val c = r.credential
            if (c is CustomCredential && c.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                Result.Token(GoogleIdTokenCredential.createFrom(c.data).idToken)
            } else Result.Failed("Google sign-in didn't work. Try email instead.")
        } catch (e: GetCredentialCancellationException) {
            Result.Cancelled
        } catch (e: NoCredentialException) {
            Result.Failed("Add a Google account to this phone in Settings first, or use your email instead.")
        } catch (e: GetCredentialException) {
            // Most often the app's Google set-up (package name and signing key) doesn't match this build.
            Log.w("GoogleSignIn", "getCredential failed: ${e.type} ${e.message}")
            Result.Failed("Google sign-in didn't work on this phone. Try email instead.")
        }
    }
}
