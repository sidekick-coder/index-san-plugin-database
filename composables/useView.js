import { onMounted, onUnmounted, readonly, ref, isRef, watch } from 'vue'
import { onHook, offHook } from 'app:hook'

import { showView } from '../services/view.js'

export function useView(_databaseId = null, _collectionId = null, _viewId = null, options = {}) {
    const databaseId = isRef(_databaseId) ? _databaseId : ref(_databaseId)
    const collectionId = isRef(_collectionId) ? _collectionId : ref(_collectionId)
    const viewId = isRef(_viewId) ? _viewId : ref(_viewId)

    const view = ref(null)
    const loading = ref(false)

    async function load() {
        loading.value = true

        view.value = await showView(databaseId.value, collectionId.value, viewId.value)

        setTimeout(() => {
            loading.value = false
        }, 800)
    }

    async function refresh() {
        const newData = await showView(databaseId.value, collectionId.value, viewId.value)

        if (JSON.stringify(newData) !== JSON.stringify(view.value)) {
            view.value = newData
        }
    }

    function onUpdated(payload) {
        if (payload.databaseId !== databaseId.value) return

        if (payload.collectionId !== collectionId.value) return

        if (payload.viewId !== viewId.value) return

        refresh()
    }

    onMounted(() => onHook('view:updated', onUpdated))

    onUnmounted(() => offHook('view:updated', onUpdated))

    if (options.immediate) {
        load()
    }

    if (options.watch) {
        watch([databaseId, collectionId, viewId], load)
    }

    return {
        collectionId,
        databaseId,
        viewId,
        view: readonly(view),
        loading,

        load,
    }
}
