<script setup>
import { ref } from 'vue'

import { tryCatch } from 'app:utils'

import snackbar from 'app:snackbar'

import { createProperty, properTypes } from '../services/property.js'

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

const emit = defineEmits(['submit'])

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

    const [result, error] = await tryCatch(() =>
        createProperty(props.databaseId, props.collectionId, payload.value)
    )

    if (error) {
        loading.value = false
        snackbar.error('Failed to create property', error)
        return
    }

    setTimeout(() => {
        loading.value = false
        model.value = false
        emit('submit', result)
        snackbar.success('Property created')
    }, 800)
}
</script>

<template>
    <is-dialog v-model="model">
        <is-card class="w-dvw max-w-md">
            <is-card-head>
                <is-card-title>Create property</is-card-title>
            </is-card-head>

            <is-card-content class="flex flex-col gap-y-4">
                <is-select
                    v-model="payload.type"
                    label="Type"
                    :options="properTypes"
                    label-key="label"
                    value-key="id"
                />

                <is-text-field v-model="payload.label" label="Label" />
                <is-text-field v-model="payload.value" label="Value" />

                <div class="text-right">
                    <is-btn :loading @click="submit">Create</is-btn>
                </div>
            </is-card-content>
        </is-card>
    </is-dialog>
</template>
