<script setup>
import { onMounted, ref } from 'vue'
import { showDatabase } from '../composables/showDatabase.js'
import { updateDatabase } from '../composables/updateDatabase.js'

import snackbar from 'app:snackbar'
import { tryCatch } from 'app:utils'

const props = defineProps({
    databaseId: {
        type: String,
        required: true,
    },
})

const loading = ref(true)
const database = ref()

async function setDatabase() {
    loading.value = true

    database.value = await showDatabase(props.databaseId)

    setTimeout(() => {
        loading.value = false
    }, 1000)
}

const saving = ref(false)

async function save() {
    saving.value = true

    const [error] = await tryCatch(() => updateDatabase(props.databaseId, database.value))

    saving.value = false

    if (error) {
        snackbar.error('Failed to update database')
        return
    }

    snackbar.success('Database updated')
}

onMounted(setDatabase)
</script>
<template>
    <div class="p-4">
        <is-card v-if="database" color="body-800">
            <is-card-head>
                <is-card-title> General </is-card-title>
            </is-card-head>
            <is-card-content class="flex flex-col gap-y-4">
                <is-text-field v-model="database.id" label="ID" readonly />
                <is-text-field v-model="database.provider" label="Provider" readonly />

                <is-text-field v-model="database.label" label="Label" />
                <is-text-field v-model="database.description" label="Description" />
                <is-text-field v-model="database.icon" label="Icon" />

                <div class="text-right">
                    <is-btn color="primary" :loading="saving" @click="save"> Save </is-btn>
                </div>
            </is-card-content>
        </is-card>
    </div>
</template>
