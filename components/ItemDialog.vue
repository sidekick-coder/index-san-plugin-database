<script setup>
import { onMounted, ref } from 'vue'
import { listProperties } from '../services/property.js'

import ItemProperty from './ItemProperty.vue'

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
})

const model = defineModel({
    type: Boolean,
})

// properties
const properties = ref([])

async function setProperties() {
    const response = await listProperties(props.databaseId, props.collectionId)

    properties.value = response.toSorted((a, b) => (a.order || 99) - (b.order || 99))
}

onMounted(setProperties)
</script>

<template>
    <is-dialog v-model="model">
        <is-card class="w-dvw max-w-xl">
            <is-card-head>
                <is-card-title>Item</is-card-title>

                <div class="flex items-center gap-x-2">
                    <is-btn
                        size="none"
                        color="none"
                        class="size-8 hover:bg-body-500"
                        variant="text"
                        @click="model = false"
                    >
                        <is-icon name="close" />
                    </is-btn>
                </div>
            </is-card-head>

            <is-card-content class="flex flex-col gap-y-4">
                <ItemProperty
                    v-for="property in properties"
                    :key="property.id"
                    :database-id
                    :collection-id
                    :property-id="property.id"
                    :item-id
                    :property="property"
                />
            </is-card-content>
        </is-card>
    </is-dialog>
</template>
