import { onMounted, onUnmounted, readonly, ref } from 'vue'
import { showDatabase } from '../services/database.js'

import { onHook, offHook } from 'app:hook'

export function useDatabase(payloadId = null) {
    const id = ref(payloadId)
    const database = ref(null)
    const loading = ref(false)

    async function load() {
        loading.value = true

        database.value = await showDatabase(id.value)

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

    return {
        id,
        database: readonly(database),
        loading,

        load,
    }
}
