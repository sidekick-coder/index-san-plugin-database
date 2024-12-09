<script setup>
import { ref, watch } from 'vue'

import PropertyIcon from '../components/PropertyIcon.vue'
import { get, set } from 'app:utils'
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
    propertyId: {
        type: String,
        required: true,
    },
    item: {
        type: Object,
        required: true,
    },
    property: {
        type: Object,
        required: true,
    },
})
const loading = ref(true)
const payload = ref()

function setPayload() {
    loading.value = true

    payload.value = get(props.item, props.property.value, '')

    loading.value = false
}

watch(() => props.item, setPayload, { immediate: true })

async function save() {
    const data = {}

    set(data, props.property.value, payload.value)

    await updateItem(props.databaseId, props.collectionId, props.item.id, data)
}
</script>

<template>
    <div class="flex w-full border border-body-500 rounded overflow-hidden">
        <is-btn
            variant="text"
            class="w-2/12 text-body-50 rounded-none"
            color="body-500"
            content-class="justify-start"
            :to="{
                name: 'app-page',
                params: { name: 'property' },
                query: {
                    databaseId,
                    collectionId,
                    propertyId,
                },
            }"
        >
            <PropertyIcon :property="property" />

            <div class="ml-2 font-bold">{{ property.label }}</div>
        </is-btn>

        <div class="w-10/12 border-l border-body-500">
            <is-checkbox
                v-if="property.type === 'boolean'"
                v-model="payload"
                class="px-4 py-3 text-body-0"
                @change="save"
            />

            <is-flat-input
                v-else
                v-model="payload"
                class="px-4 py-3 text-body-0 focus:bg-body-700"
                :readonly="property.value === 'id'"
                @change="save"
            />
        </div>
    </div>
</template>
