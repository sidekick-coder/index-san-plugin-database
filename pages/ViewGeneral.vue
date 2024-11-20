<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import snackbar from 'app:snackbar'
import { tryCatch } from 'app:utils'

import { updateView } from '../services/view.js'

const props = defineProps({
    databaseId: {
        type: String,
        required: true,
    },
    collectionId: {
        type: String,
        required: true,
    },
    viewId: {
        type: String,
        required: true,
    },
    view: {
        type: Object,
        required: true,
    },
})

// payload
const loading = ref(true)
const payload = ref()
const components = [
    {
        label: 'Table',
        value: 'database-table',
    },
]

function setPayload() {
    loading.value = true

    payload.value = {
        label: props.view.label,
        description: props.view.description,
        icon: props.view.icon,
        component: props.view.component,
    }

    setTimeout(() => {
        loading.value = false
    }, 800)
}

watch(() => props.view, setPayload, { immediate: true, deep: true })

const saving = ref(false)

async function save() {
    saving.value = true

    const [, error] = await tryCatch(() =>
        updateView(props.databaseId, props.collectionId, props.viewId, payload.value)
    )

    saving.value = false

    if (error) {
        snackbar.error('Failed to update view', error)
        return
    }

    snackbar.success('Item updated')
}
</script>
<template>
    <div class="p-4">
        <is-card v-if="payload" color="body-800">
            <is-card-head>
                <is-card-title> General </is-card-title>
            </is-card-head>
            <is-card-content class="flex flex-col gap-y-4">
                <is-select v-model="payload.component" label="Component" :options="components" />

                <is-text-field v-model="payload.label" label="Label" />
                <is-text-field v-model="payload.description" label="Description" />
                <is-text-field v-model="payload.icon" label="Icon" />

                <div class="text-right">
                    <is-btn color="primary" :loading="saving" @click="save"> Save </is-btn>
                </div>
            </is-card-content>
        </is-card>
    </div>
</template>
