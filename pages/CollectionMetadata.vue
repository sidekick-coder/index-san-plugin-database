<script setup>
import { onMounted, ref } from 'vue'

import snackbar from 'app:snackbar'
import { tryCatch } from 'app:utils'

import { showCollection, updateCollection } from '../services/collection.js'
import { showDatabase } from '../services/database.js'

const props = defineProps({
    databaseId: {
        type: String,
        required: true,
    },
    collectionId: {
        type: String,
        required: true,
    },
})

// database
const database = ref()

async function setDatabase() {
    database.value = await showDatabase(props.databaseId)
}

// collection
const collection = ref()

async function setCollection() {
    collection.value = await showCollection(props.databaseId, props.collectionId)
}

// metadata
const loading = ref(true)
const payload = ref()

async function load() {
    loading.value = true

    await setDatabase()
    await setCollection()

    payload.value = collection.value.metadata || {}

    setTimeout(() => {
        loading.value = false
    }, 1000)
}

onMounted(load)

// save
const saving = ref(false)

async function save() {
    saving.value = true

    const [, error] = await tryCatch(() =>
        updateCollection(props.databaseId, props.collectionId, {
            ...collection.value,
            metadata: payload.value,
        })
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
                <is-card-title> Metadata </is-card-title>
            </is-card-head>
            <is-card-content class="flex flex-col gap-y-4">
                <template v-if="database?._provider?.collection?.meta_fields?.length">
                    <div v-for="f in database._provider.collection.meta_fields" :key="f.name">
                        <is-text-field v-model="payload[f.name]" :label="f.label" />
                        <small v-if="f.description" class="text-xs text-body-500">
                            {{ f.description }}
                        </small>
                    </div>
                </template>

                <div class="text-right">
                    <is-btn color="primary" :loading="saving" @click="save"> Save </is-btn>
                </div>
            </is-card-content>
        </is-card>
    </div>
</template>
