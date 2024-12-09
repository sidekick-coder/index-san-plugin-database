<script setup>
import { ref, watch } from 'vue'

import { get, set } from 'app:utils'
import { updateItem } from '../services/item.js'
import { useItem } from '../composables/useItem.js'

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
    propertyId: {
        type: String,
        required: true,
    },
    property: {
        type: Object,
        required: true,
    },
    options: {
        type: Object,
        default: () => ({}),
    },
})

const { item } = useItem(props.databaseId, props.collectionId, props.itemId, props.options)

const loading = ref(true)
const payload = ref()

async function setPayload() {
    loading.value = true

    payload.value = get(item.value, props.property.value, '')

    loading.value = false
}

watch(item, setPayload, { immediate: true })

async function save() {
    const data = {}

    set(data, props.property.value, payload.value)

    await updateItem(props.databaseId, props.collectionId, props.itemId, data)
}
</script>

<template>
    <is-checkbox
        v-if="property.type === 'boolean'"
        v-model="payload"
        size="sm"
        class="h-full px-4 py-2"
        @change="save"
    />

    <is-flat-input
        v-else
        v-model="payload"
        :readonly="property.value === 'id'"
        class="focus:bg-body-500 px-4 py-2"
        @change="save"
    />
</template>
