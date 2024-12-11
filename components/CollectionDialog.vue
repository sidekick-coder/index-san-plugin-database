<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { tryCatch } from 'app:utils'

import snackbar from 'app:snackbar'

import { createCollection } from '../services/collection.js'

const props = defineProps({
    provider: {
        type: String,
        required: true,
    },
    databaseId: {
        type: String,
        required: true,
    },
    metaFields: {
        type: Array,
        default: () => [],
    },
})

const emit = defineEmits(['submit'])

const router = useRouter()

const model = defineModel({
    type: Boolean,
})

const loading = ref(false)

const payload = ref({
    label: '',
    description: '',
    metadata: {},
})

async function submit() {
    loading.value = true

    const [collection, error] = await tryCatch(() =>
        createCollection(props.databaseId, payload.value)
    )

    if (error) {
        loading.value = false
        snackbar.error('Failed to create collection', error)
        console.error(error)
        return
    }

    router.push({
        name: 'app-page',
        params: { name: 'collection' },
        query: { databaseId: props.databaseId, collectionId: collection.id },
    })

    setTimeout(() => {
        loading.value = false
        model.value = false
        emit('submit', collection)
    }, 800)
}
</script>

<template>
    <is-dialog v-model="model">
        <is-card class="w-dvw max-w-md">
            <is-card-head>
                <is-card-title>Create collection</is-card-title>
            </is-card-head>

            <is-card-content class="flex flex-col gap-y-4">
                <is-text-field v-model="payload.label" label="Label" />
                <is-text-field v-model="payload.description" label="Description" />

                <div v-for="field in metaFields" :key="field.name">
                    <is-text-field v-model="payload.metadata[field.name]" :label="field.label" />
                    <small v-if="field.description" class="text-xs text-body-500">
                        {{ field.description }}
                    </small>
                </div>

                <div class="text-right">
                    <is-btn :loading @click="submit">Create</is-btn>
                </div>
            </is-card-content>
        </is-card>
    </is-dialog>
</template>
