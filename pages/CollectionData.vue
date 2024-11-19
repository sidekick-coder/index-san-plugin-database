<script setup>
import { onMounted, ref } from 'vue'

import snackbar from 'app:snackbar'
import dialog from 'app:dialog'
import { tryCatch } from 'app:utils'

import ItemDialog from '../components/ItemDialog.vue'
import { listItems } from '../services/item.js'
import { listProperties } from '../services/property.js'

const props = defineProps({
    database: {
        type: Object,
        required: true,
    },
    collection: {
        type: Object,
        required: true,
    },
    databaseId: {
        type: String,
        required: true,
    },
    collectionId: {
        type: String,
        required: true,
    },
})

// data
const loading = ref(false)
const items = ref([])
const meta = ref({})

async function loadPage(page) {
    loading.value = true

    const { data, meta: _meta } = await listItems(props.databaseId, props.collectionId, {
        limit: 10,
        page,
    })

    items.value = data
    meta.value = _meta

    setTimeout(() => {
        loading.value = false
    }, 800)
}

async function refresh() {
    await loadPage(meta.value.page)
}

onMounted(loadPage)

// properties
const properties = ref([])

async function loadProperties() {
    properties.value = await listProperties(props.databaseId, props.collectionId)
}

onMounted(loadProperties)

// actions
const showDialog = ref(false)

const delitingId = ref(null)

async function destroy(property) {
    if (!(await dialog.confirm())) return

    delitingId.value = property.id

    const [, error] = await tryCatch(() =>
        destroyProperty(props.databaseId, props.collectionId, property.id)
    )

    if (error) {
        delitingId.value = null
        snackbar.error('Failed to destroy property', error)
        return
    }

    items.value = items.value.filter((item) => item.id !== property.id)

    setTimeout(() => {
        delitingId.value = null
        snackbar.success('Property deleted')
    }, 800)
}
</script>
<template>
    <div class="p-4">
        <is-card color="body-800" class="flex flex-col">
            <is-card-head class="flex">
                <div class="flex-1">
                    <is-card-title> Data </is-card-title>
                    <is-card-subtitle>Items of the collection</is-card-subtitle>
                </div>

                <div class="flex gap-x-2">
                    <is-btn @click="refresh">
                        <is-icon name="heroicons:arrow-path" />
                    </is-btn>

                    <is-btn
                        v-if="database?._capabilities?.includes('item.create')"
                        @click="showDialog = true"
                    >
                        Add new
                    </is-btn>
                </div>
            </is-card-head>

            <item-dialog
                v-model="showDialog"
                :database-id
                :collection-id
                :properties
                @submit="refresh"
            />

            <is-card-content class="flex-1 relative h-inherit">
                <div v-if="loading" class="w-full h-80 flex items-center justify-center">
                    <is-spinner />
                </div>

                <is-card v-else-if="!items.length" color="body-800">
                    <is-card-content class="text-center">
                        <is-icon name="heroicons:document-search" class="text-4xl" />
                        <p class="text-lg">No items found</p>
                    </is-card-content>
                </is-card>

                <div v-else class="flex flex-col gap-y-4 min-h-full">
                    <is-card v-for="item in items" :key="item.id">
                        <is-card-content>
                            <pre v-text="item" />
                        </is-card-content>
                    </is-card>

                    <is-pagination
                        v-if="meta.last_page > 1"
                        class="mt-auto"
                        :model-value="meta.page"
                        :total="meta.last_page"
                        @update:model-value="loadPage"
                    />
                </div>
            </is-card-content>
        </is-card>
    </div>
</template>
