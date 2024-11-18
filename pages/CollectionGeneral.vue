<script setup>
import { onMounted, ref } from 'vue'

import snackbar from 'app:snackbar'
import { tryCatch } from 'app:utils'

import { showCollection, updateCollection } from '../services/collection.js'

const props = defineProps({
    databaseId: {
        type: String,
        required: true,
    },
    collectionId: {
        type: String,
        required: true,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
})

const loading = ref(true)
const payload = ref()

async function setDatabase() {
    loading.value = true

    payload.value = await showCollection(props.databaseId, props.collectionId)

    setTimeout(() => {
        loading.value = false
    }, 1000)
}

const saving = ref(false)

async function save() {
    saving.value = true

    const [, error] = await tryCatch(() =>
        updateCollection(props.databaseId, props.collectionId, payload.value)
    )

    saving.value = false

    if (error) {
        snackbar.error('Failed to update collection', error)
        return
    }

    snackbar.success('Collection updated')
}

onMounted(setDatabase)
</script>
<template>
    <div class="p-4">
        <is-card v-if="payload" color="body-800">
            <is-card-head>
                <is-card-title> General </is-card-title>
            </is-card-head>
            <is-card-content class="flex flex-col gap-y-4">
                <is-text-field v-model="payload.id" label="ID" readonly />

                <is-text-field v-model="payload.label" label="Label" :readonly="readonly" />
                <is-text-field
                    v-model="payload.description"
                    label="Description"
                    :readonly="readonly"
                />
                <is-text-field v-model="payload.icon" label="Icon" :readonly="readonly" />

                <div class="text-right">
                    <is-btn color="primary" :loading="saving" @click="save"> Save </is-btn>
                </div>
            </is-card-content>
        </is-card>
    </div>
</template>
