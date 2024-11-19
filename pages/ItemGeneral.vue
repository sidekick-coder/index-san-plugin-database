<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import snackbar from 'app:snackbar'
import { tryCatch, get, set } from 'app:utils'

import { listProperties, updateProperty } from '../services/property.js'
import { updateItem } from '../services/item.js'

const props = defineProps({
    databaseId: {
        type: String,
        required: true,
    },
    collectionId: {
        type: String,
        required: true,
    },
    itemId: {
        type: String,
        required: true,
    },
    database: {
        type: Object,
        required: true,
    },
    item: {
        type: Object,
        required: true,
    },
})

// database
const readonly = computed(() => !props.database._capabilities?.includes('item.update'))

// properties
const properties = ref([])

async function setProperties() {
    properties.value = await listProperties(props.databaseId, props.collectionId)
}

onMounted(setProperties)

// payload
const loading = ref(true)
const payload = ref({})

function setPayload() {
    loading.value = true

    properties.value.forEach((p) => {
        const value = get(props.item, p.value)

        set(payload.value, p.value, value)
    })

    setTimeout(() => {
        loading.value = false
    }, 800)
}

watch([properties, () => props.item], setPayload)

const saving = ref(false)

async function save() {
    saving.value = true

    const [, error] = await tryCatch(() =>
        updateItem(props.databaseId, props.collectionId, props.itemId, payload.value)
    )

    saving.value = false

    if (error) {
        snackbar.error('Failed to update item', error)
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
                <is-text-field :model-value="item.id" label="ID" readonly />

                <is-text-field
                    v-for="p in properties"
                    :key="p.id"
                    :label="p.label"
                    :model-value="get(payload, p.value)"
                    :readonly="readonly"
                    @update:model-value="set(payload, p.value, $event)"
                />

                <div v-if="!readonly" class="text-right">
                    <is-btn color="primary" :loading="saving" @click="save"> Save </is-btn>
                </div>
            </is-card-content>
        </is-card>
    </div>
</template>
