<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import snackbar from 'app:snackbar'
import { tryCatch, copy } from 'app:utils'

import { updateProperty, properTypes } from '../services/property.js'

const props = defineProps({
    databaseId: {
        type: String,
        required: true,
    },
    collectionId: {
        type: String,
        required: true,
    },
    propertyId: {
        type: String,
        required: true,
    },
    database: {
        type: Object,
        required: true,
    },
    property: {
        type: Object,
        required: true,
    },
})

// database

const readonly = computed(() => !props.database._capabilities?.includes('property.update'))

// payload
const loading = ref(true)
const payload = ref()

function setPayload() {
    loading.value = true

    payload.value = copy(props.property)

    setTimeout(() => {
        loading.value = false
    }, 800)
}

watch(() => props.property, setPayload, { immediate: true, deep: true })

const saving = ref(false)

async function save() {
    saving.value = true

    const [, error] = await tryCatch(() =>
        updateProperty(props.databaseId, props.collectionId, props.propertyId, payload.value)
    )

    saving.value = false

    if (error) {
        snackbar.error('Failed to update property', error)
        return
    }

    snackbar.success('Property updated')
}
</script>
<template>
    <div class="p-4">
        <is-card v-if="payload" color="body-800">
            <is-card-head>
                <is-card-title> General </is-card-title>
            </is-card-head>
            <is-card-content class="flex flex-col gap-y-4">
                <is-text-field :model-value="property.id" label="ID" readonly />
                <is-text-field v-model="payload.label" label="Label" :readonly="readonly" />
                <is-text-field v-model="payload.value" label="Value" :readonly="readonly" />
                <is-select
                    v-model="payload.type"
                    label="Type"
                    :options="properTypes"
                    label-key="label"
                    value-key="id"
                    :readonly="readonly"
                />

                <is-text-field v-model="payload.order" label="Order" :readonly="readonly" />
                <is-text-field
                    v-model="payload.description"
                    label="Description"
                    :readonly="readonly"
                />
                <is-text-field v-model="payload.icon" label="Icon" :readonly="readonly" />

                <div v-if="!readonly" class="text-right">
                    <is-btn color="primary" :loading="saving" @click="save"> Save </is-btn>
                </div>
            </is-card-content>
        </is-card>
    </div>
</template>
