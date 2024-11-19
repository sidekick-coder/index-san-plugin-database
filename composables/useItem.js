import { onMounted, onUnmounted, readonly, ref, isRef, watch } from 'vue'
import { onHook, offHook } from 'app:hook'
import { showItem } from '../services/item.js'

export function useItem(_databaseId = null, _collectionId = null, _itemId = null, options = {}) {
    const databaseId = isRef(_databaseId) ? _databaseId : ref(_databaseId)
    const collectionId = isRef(_collectionId) ? _collectionId : ref(_collectionId)
    const itemId = isRef(_itemId) ? _itemId : ref(_itemId)

    const item = ref(null)
    const loading = ref(false)

    async function load() {
        loading.value = true

        item.value = await showItem(databaseId.value, collectionId.value, itemId.value)

        setTimeout(() => {
            loading.value = false
        }, 800)
    }

    async function refresh() {
        const newData = await showItem(databaseId.value, collectionId.value, itemId.value)

        if (JSON.stringify(newData) !== JSON.stringify(item.value)) {
            item.value = newData
        }
    }

    function onUpdated(payload) {
        if (payload.databaseId !== databaseId.value) return

        if (payload.collectionId !== collectionId.value) return

        if (payload.itemId !== itemId.value) return

        refresh()
    }

    onMounted(() => onHook('item:updated', onUpdated))

    onUnmounted(() => offHook('item:updated', onUpdated))

    if (options.immediate) {
        load()
    }

    if (options.watch) {
        watch([databaseId, collectionId, itemId], load)
    }

    return {
        collectionId,
        databaseId,
        itemId,
        item: readonly(item),
        loading,

        load,
    }
}
