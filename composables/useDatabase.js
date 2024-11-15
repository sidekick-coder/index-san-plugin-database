import { onMounted, onUnmounted, readonly, ref } from 'vue'
import { showDatabase } from './showDatabase.js'

import { onHook, offHook } from 'app:hook'

export function useDatabase(id) {
    const database = ref(null)
    const loading = ref(false)

    async function load() {
        loading.value = true

        database.value = await showDatabase(id)

        loading.value = false
    }

    async function refresh() {
        const newDatabase = await showDatabase(id)

        if (JSON.stringify(newDatabase) !== JSON.stringify(database.value)) {
            database.value = newDatabase
        }
    }

    function onDatabaseUpdated({ id: updatedId }) {
        if (updatedId === id) {
            refresh()
        }
    }

    onMounted(() => onHook('database:updated', onDatabaseUpdated))

    onUnmounted(() => offHook('database:updated', onDatabaseUpdated))

    return {
        database: readonly(database),
        loading,

        load,
    }
}
