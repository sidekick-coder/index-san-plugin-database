import { readonly, ref, isRef, onUnmounted, onMounted, computed, reactive } from 'vue'
import { onHook } from 'app:hook'
import { showItem } from '../services/item.js'

const state = reactive(new Map())

onHook('item:updated', ({ databaseId, collectionId, itemId, payload }) => {
    const key = `${databaseId}-${collectionId}-${itemId}`

    const instances = state.get(`${key}:instances`)

    if (instances) {
        state.set(`${key}:item`, payload)
    }
})

export function useItem(_databaseId = null, _collectionId = null, _itemId = null, options = {}) {
    const databaseId = isRef(_databaseId) ? _databaseId : ref(_databaseId)
    const collectionId = isRef(_collectionId) ? _collectionId : ref(_collectionId)
    const itemId = isRef(_itemId) ? _itemId : ref(_itemId)

    const key = computed(() => `${databaseId.value}-${collectionId.value}-${itemId.value}`)

    const item = computed({
        get() {
            return state.get(`${key.value}:item`) || null
        },
        set(value) {
            state.set(`${key.value}:item`, value)
        },
    })

    const loading = computed({
        get() {
            return state.get(`${key.value}:loading`) || false
        },
        set(value) {
            state.set(`${key.value}:loading`, value)
        },
    })

    const instances = computed({
        get() {
            return state.get(`${key.value}:instances`) || 0
        },
        set(value) {
            state.set(`${key.value}:instances`, value)
        },
    })

    async function load() {
        loading.value = true

        item.value = await showItem(databaseId.value, collectionId.value, itemId.value)

        setTimeout(() => {
            loading.value = false
        }, 800)
    }

    if (options.initial && !item.value) {
        item.value = options.initial
    }

    if (!item.value && !loading.value) {
        load()
    }

    onMounted(() => {
        instances.value++
    })

    onUnmounted(() => {
        instances.value--

        if (instances.value === 0) {
            state.delete(`${key.value}:item`)
            state.delete(`${key.value}:instances`)
            state.delete(`${key.value}:loading`)
        }
    })

    return {
        collectionId,
        databaseId,
        itemId,
        item: readonly(item),
        loading,

        load,
    }
}
