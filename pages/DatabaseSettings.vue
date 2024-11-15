<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

import dialog from 'app:dialog'
import snackbar from 'app:snackbar'
import { tryCatch } from 'app:utils'

import { destroyDatabase } from '../composables/destroyDatabase.js'

const props = defineProps({
    databaseId: {
        type: String,
        required: true,
    },
})

const router = useRouter()
const loading = ref(false)

async function destroy() {
    if (!(await dialog.confirm())) return

    loading.value = true

    const [, error] = await tryCatch(() => destroyDatabase(props.databaseId))

    if (error) {
        snackbar.error(error.message)
        loading.value = false
        return
    }

    setTimeout(() => {
        loading.value = false
        snackbar.success('Database deleted')

        router.push({ name: 'app-page', params: { name: 'databases' } })
    }, 800)
}
</script>
<template>
    <div class="p-4">
        <is-card>
            <is-card-head class="flex-col items-start">
                <is-card-title>Delete</is-card-title>
                <is-card-subtitle>
                    This will delete database declaration only, data will be keeped
                </is-card-subtitle>
            </is-card-head>

            <is-card-content>
                <is-btn color="danger" :loading @click="destroy">Delete database</is-btn>
            </is-card-content>
        </is-card>
    </div>
</template>
