<script setup>
import { ref } from 'vue'

import { tryCatch, get, set } from 'app:utils'
import snackbar from 'app:snackbar'

import { createItem } from '../services/item.js'

const props = defineProps({
    databaseId: {
        type: String,
        required: true,
    },
    collectionId: {
        type: String,
        required: true,
    },
    properties: {
        type: Array,
        default: () => [],
    },
})

const emit = defineEmits(['submit'])

const model = defineModel({
    type: Boolean,
})

const loading = ref(false)

const payload = ref({})

async function submit() {
    loading.value = true

    const [collection, error] = await tryCatch(() =>
        createItem(props.databaseId, props.collectionId, payload.value)
    )

    if (error) {
        loading.value = false
        snackbar.error('Failed to create item', error)
        return
    }

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
                <is-card-title>Create item</is-card-title>
            </is-card-head>

            <is-card-content class="flex flex-col gap-y-4">
                <div v-for="p in properties" :key="p.id">
                    <is-text-field
                        :label="p.label"
                        :model-value="get(payload, p.value)"
                        @update:model-value="set(payload, p.value, $event)"
                    />

                    <small v-if="p.description" class="text-xs text-body-500">
                        {{ p.description }}
                    </small>
                </div>

                <div class="text-right">
                    <is-btn :loading @click="submit">Create</is-btn>
                </div>
            </is-card-content>
        </is-card>
    </is-dialog>
</template>
