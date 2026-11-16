package pk.examwise.app.ui

import androidx.compose.runtime.Composable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import pk.examwise.core.api.ApiError

/* One screen's data: the cached copy at once, then the fresh one. An error is only shown when there is nothing
   to show instead. */
data class Load<T>(val data: T? = null, val loading: Boolean = true, val error: String? = null, val offline: Boolean = false)

class LoadViewModel<T>(private val cached: suspend () -> T?, private val fresh: suspend () -> T) : ViewModel() {
    private val _state = MutableStateFlow(Load<T>())
    val state: StateFlow<Load<T>> = _state.asStateFlow()

    init { refresh() }

    fun refresh() {
        viewModelScope.launch {
            _state.value = _state.value.copy(loading = true, error = null)
            if (_state.value.data == null) runCatching { cached() }.getOrNull()?.let { _state.value = _state.value.copy(data = it) }
            try {
                _state.value = Load(fresh(), loading = false)
            } catch (e: ApiError) {
                _state.value = _state.value.copy(loading = false, error = if (_state.value.data == null) e.message else null, offline = e.isOffline)
            }
        }
    }

    fun set(value: T) { _state.value = _state.value.copy(data = value) }
}

@Suppress("UNCHECKED_CAST")
@Composable
fun <T> rememberLoad(key: String, cached: suspend () -> T? = { null }, fresh: suspend () -> T): LoadViewModel<T> =
    viewModel(
        modelClass = LoadViewModel::class,
        key = key,
        factory = object : ViewModelProvider.Factory {
            override fun <V : ViewModel> create(modelClass: Class<V>): V = LoadViewModel(cached, fresh) as V
        },
    ) as LoadViewModel<T>
