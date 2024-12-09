<script setup>
import PropertyIcon from '../components/PropertyIcon.vue'
import ItemPropertyValue from './ItemPropertyValue.vue'

import { useProperty } from '../composables/useProperty.js'

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
    itemId: {
        type: String,
        required: true,
    },
    property: {
        type: Object,
        required: true,
    },
})
</script>

<template>
    <div class="flex w-full border border-body-500 rounded overflow-hidden">
        <is-btn
            variant="text"
            class="text-body-50 rounded-none w-40"
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

            <div class="ml-2 font-bold truncate">{{ property.label }}</div>
        </is-btn>

        <div class="flex-1 border-l border-body-500">
            <ItemPropertyValue :database-id :collection-id :item-id :property-id :property />
        </div>
    </div>
</template>
