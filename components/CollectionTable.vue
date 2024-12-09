<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { listItems } from '../services/item.js'
import { listProperties } from '../services/property.js'

import PropertyIcon from './PropertyIcon.vue'
import ItemValue from './ItemValue.vue'
import CollectionPagination from './CollectionPagination.vue'

const props = defineProps({
    databaseId: {
        type: String,
        required: true,
    },
    collectionId: {
        type: String,
        required: true,
    },
    limit: {
        type: Number,
        default: 10,
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
const pagination = ref({})
const loading = ref(true)

const fields = computed(() => {
    let visible = allProperties.value

    if (properties.value.length) {
        visible = properties.value
            .map((p) => ({
                ...allProperties.value.find((p2) => p2.name === p.name),
                ...p,
            }))
            .filter((p) => p)
    }

    return visible.map((p) => ({
        ...p,
        name: p.id,
    }))
})

async function setItems() {
    loading.value = true

    const response = await listItems(props.databaseId, props.collectionId, {
        page: pagination.value.page,
        limit: props.limit,
    })

    items.value = response.data
    pagination.value = response.pagination

    setTimeout(() => {
        loading.value = false
    }, 500)
}

async function setFields() {
    const response = await listProperties(props.databaseId, props.collectionId)

    allProperties.value = response
}

watch(() => pagination.value.page, setItems, { immediate: true })

onMounted(() => {
    setFields()
})
</script>

<template>
    <is-card color="body-800" class="w-full border border-body-500">
        <is-data-table
            :loading
            :fields
            :items
            item-field-class="focus-within:bg-body-500"
            field-class="border-0"
        >
            <template #field="{ field }">
                <div class="flex items-center h-full">
                    <PropertyIcon :property="field" />
                    <span class="ml-2">{{ field.label }}</span>
                </div>
            </template>

            <template v-for="field in fields" #[`item-${field.id}`]="{ item }" :key="field.id">
                <ItemValue
                    :database-id="databaseId"
                    :collection-id="collectionId"
                    :item-id="item.id"
                    :property-id="field.id"
                    :property="field"
                    :options="{ initial: item }"
                />
            </template>
        </is-data-table>

        <CollectionPagination v-model="pagination" />
    </is-card>
</template>
