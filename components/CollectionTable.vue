<script setup>
import { computed, onMounted, ref } from 'vue'
import { listItems } from '../services/item.js'
import { listProperties } from '../services/property.js'

import PropertyIcon from './PropertyIcon.vue'
import ItemValue from './ItemValue.vue'

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

const properties = defineModel('properties', {
    type: Array,
    default: () => [],
    get: (value) => {
        return value.map((p) => {
            if (typeof p === 'string') {
                return { name: p }
            }

            return p
        })
    },
})

const items = ref([])
const allProperties = ref([])
const meta = ref({})

const fields = computed(() => {
    let visible = allProperties.value

    if (properties.value.length) {
        visible = properties.value
            .map((p) => allProperties.value.find((p2) => p2.name === p.name))
            .filter((p) => p)
    }

    return visible.map((p) => ({
        name: p.name,
        label: p.label,
        property: p,
    }))
})

async function setItems() {
    const response = await listItems(props.databaseId, props.collectionId)

    items.value = response.data
    meta.value = response.meta
}

async function setFields() {
    const response = await listProperties(props.databaseId, props.collectionId)

    allProperties.value = response
}

onMounted(() => {
    setItems()
    setFields()
})
</script>

<template>
    <is-card color="none" class="border-x border-body-500 w-full">
        <is-data-table :fields="fields" :items="items" item-field-class="focus-within:bg-body-500">
            <template #field="{ field }">
                <div class="flex items-center">
                    <PropertyIcon :property="field.property" size="sm" />
                    <span class="ml-2">{{ field.label }}</span>
                </div>
            </template>

            <template v-for="field in fields" #[`item-${field.name}`]="{ item }" :key="field.name">
                <ItemValue
                    :database-id="databaseId"
                    :collection-id="collectionId"
                    :item-id="item.id"
                    :property-id="field.property.id"
                    :property="field.property"
                    :options="{ initial: item }"
                />
            </template>
        </is-data-table>
    </is-card>
</template>
