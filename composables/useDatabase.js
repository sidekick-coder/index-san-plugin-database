import { onMounted, onUnmounted, readonly, ref, isRef, watch } from 'vue'
import { showDatabase } from '../services/database.js'

import { onHook, offHook } from 'app:hook'

export function useDatabase(_databaseId = null, options = {}) {
    const databaseId = isRef(_databaseId) ? _databaseId : ref(_databaseId)

    const database = ref(null)
    const loading = ref(false)

    async function load() {
        loading.value = true

        database.value = await showDatabase(databaseId.value)

        setTimeout(() => {
            loading.value = false
        }, 800)
    }

    async function refresh() {
        const newDatabase = await showDatabase(id.value)

        if (JSON.stringify(newDatabase) !== JSON.stringify(database.value)) {
            database.value = newDatabase
        }
    }

    function onDatabaseUpdated({ id: updatedId }) {
        if (updatedId === id.value) {
            refresh()
        }
    }

    onMounted(() => onHook('database:updated', onDatabaseUpdated))

    onUnmounted(() => offHook('database:updated', onDatabaseUpdated))

    if (options.immediate) {
        load()
    }

    if (options.watch) {
        watch(databaseId, load)
    }

    return {
        databaseId,
        database: readonly(database),
        loading,

        load,
    }
}
