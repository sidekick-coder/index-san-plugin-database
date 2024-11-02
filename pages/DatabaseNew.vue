<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createDatabase } from '../composables/createDatabase.js'

import snackbar from 'app:snackbar'
import { listProviders } from '../composables/listProviders.js'

// general
const router = useRouter()

const payload = ref({
    id: '',
    type: 'entry',
    name: '',
})

// providers
const providers = ref([])

async function setProviders() {
    providers.value = await listProviders()
}

onMounted(setProviders)

async function submit() {
    try {
        const database = await createDatabase(payload.value)

        snackbar.success('Database created')

        router.push({
            name: 'app-page',
            params: { name: 'database' },
            query: { databaseId: database.id },
        })
    } catch (e) {
        snackbar.error(e.message)
    }
}
</script>

<template>
    <div class="p-5">
        <is-card class="px-4 py-4">
            <div class="text-2xl font-bold mb-4">Create database</div>

            <div class="flex flex-col gap-y-4">
                <is-text-field v-model="payload.id" label="ID" />
                <is-text-field v-model="payload.name" label="Name" />
                <is-text-field v-model="payload.icon" label="Icon" />

                <is-select
                    v-model="payload.provider"
                    label="Provider"
                    :options="providers"
                    label-key="label"
                    value-key="id"
                />

                <is-text-field
                    v-if="payload.provider === 'api'"
                    v-model="payload.provider_id"
                    label="API provider id"
                />

                <is-text-field
                    v-if="payload.provider === 'custom'"
                    v-model="payload.filename"
                    label="Filename"
                />

                <is-btn :disabled="!payload.id" @click="submit">Create</is-btn>
            </div>
        </is-card>
    </div>
</template>
