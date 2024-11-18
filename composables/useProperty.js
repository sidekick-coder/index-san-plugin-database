import { onMounted, onUnmounted, readonly, ref, isRef, watch } from 'vue'
import { showCollection } from '../services/collection.js'
import { onHook, offHook } from 'app:hook'
import { showProperty } from '../services/property.js'

export function useProperty(
    _databaseId = null,
    _collectionId = null,
    _propertyId = null,
    options = {}
) {
    const databaseId = isRef(_databaseId) ? _databaseId : ref(_databaseId)
    const collectionId = isRef(_collectionId) ? _collectionId : ref(_collectionId)
    const propertyId = isRef(_propertyId) ? _propertyId : ref(_propertyId)

    const property = ref(null)
    const loading = ref(false)

    async function load() {
        loading.value = true

        property.value = await showProperty(databaseId.value, collectionId.value, propertyId.value)

        setTimeout(() => {
            loading.value = false
        }, 800)
    }

    async function refresh() {
        const newData = await showProperty(databaseId.value, collectionId.value, propertyId.value)

        if (JSON.stringify(newData) !== JSON.stringify(property.value)) {
            property.value = newData
        }
    }

    function onUpdated(payload) {
        if (payload.databaseId !== databaseId.value) return

        if (payload.collectionId !== collectionId.value) return

        if (payload.propertyId !== propertyId.value) return

        refresh()
    }

    onMounted(() => onHook('property:updated', onUpdated))

    onUnmounted(() => offHook('property:updated', onUpdated))

    if (options.immediate) {
        load()
    }

    if (options.watch) {
        watch([databaseId, collectionId, propertyId], load)
    }

    return {
        collectionId,
        databaseId,
        propertyId,
        property: readonly(property),
        loading,

        load,
    }
}
