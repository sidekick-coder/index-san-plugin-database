import { onMounted, onUnmounted, readonly, ref, isRef, watch } from 'vue'
import { showCollection } from '../services/collection.js'
import { onHook, offHook } from 'app:hook'

export function useCollection(_databaseId = null, _collectionId = null, options = {}) {
    const databaseId = isRef(_databaseId) ? _databaseId : ref(_databaseId)
    const collectionId = isRef(_collectionId) ? _collectionId : ref(_collectionId)

    const collection = ref(null)
    const loading = ref(false)

    async function load() {
        loading.value = true

        collection.value = await showCollection(databaseId.value, collectionId.value)

        setTimeout(() => {
            loading.value = false
        }, 800)
    }

    async function refresh() {
        const newData = await showCollection(databaseId.value, collectionId.value)

        if (JSON.stringify(newData) !== JSON.stringify(collection.value)) {
            collection.value = newData
        }
    }

    function onUpdated(payload) {
        if (payload.collectionId === collectionId.value) {
            refresh()
        }
    }

    onMounted(() => onHook('collection:updated', onUpdated))

    onUnmounted(() => offHook('collection:updated', onUpdated))

    if (options.immediate) {
        load()
    }

    if (options.watch) {
        watch([databaseId, collectionId], load)
    }

    return {
        collectionId,
        databaseId,
        collection: readonly(collection),
        loading,

        load,
    }
}
