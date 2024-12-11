<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import snackbar from 'app:snackbar'
import { tryCatch } from 'app:utils'

import { createDatabase } from '../services/database.js'

import { listProviders } from '../services/provider.js'

const model = defineModel({
    type: Boolean,
})

// general
const router = useRouter()

const payload = ref({
    label: '',
    icon: '',
    description: '',
    provider: 'entry',
})

// providers
const providers = ref([])

async function setProviders() {
    providers.value = await listProviders()
}

onMounted(setProviders)

// create
const creating = ref(false)

async function submit() {
    creating.value = true

    const [database, error] = await tryCatch(() => createDatabase(payload.value))

    if (error) {
        snackbar.error(error.message)
        creating.value = false
        return
    }

    snackbar.success('Database created')

    router.push({
        name: 'app-page',
        params: { name: 'database' },
        query: { databaseId: database._id },
    })

    setTimeout(() => {
        model.value = false
        creating.value = false

        payload.value = {
            id: '',
            label: '',
            provider: 'entry',
        }
    }, 100)
}
</script>

<template>
    <is-dialog v-model="model">
        <div class="p-5">
            <is-card class="px-4 py-4">
                <div class="text-2xl font-bold mb-4">Create database</div>

                <div class="flex flex-col gap-y-4">
                    <is-text-field v-model="payload.label" label="Label" />
                    <is-text-field v-model="payload.icon" label="Icon" />

                    <is-select
                        v-model="payload.provider"
                        label="Provider"
                        :options="providers"
                        label-key="label"
                        value-key="id"
                    />

                    <is-text-field
                        v-if="payload.provider === 'custom'"
                        v-model="payload.filename"
                        label="Filename"
                    />

                    <is-btn :loading="creating" @click="submit"> Create </is-btn>
                </div>
            </is-card>
        </div>
    </is-dialog>
</template>
