<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import snackbar from 'app:snackbar'
import dialog from 'app:dialog'
import { tryCatch } from 'app:utils'

import { createItem, destroyItem, listItems } from '../services/item.js'
import { listProperties } from '../services/property.js'
import CollectionPagination from '../components/CollectionPagination.vue'

// general
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

const router = useRouter()

// data
const loading = ref(false)
const items = ref([])
const pagination = ref({})

async function load() {
    loading.value = true

    const response = await listItems(props.databaseId, props.collectionId, {
        limit: 10,
        page: pagination.value.page,
    })

    items.value = response.data
    pagination.value = response.pagination

    setTimeout(() => {
        loading.value = false
    }, 800)
}

async function refresh() {
    await load()
}

onMounted(load)

watch(() => pagination.value.page, load)

// properties
const properties = ref([])

async function loadProperties() {
    properties.value = await listProperties(props.databaseId, props.collectionId)
}

onMounted(loadProperties)

// actions
const creating = ref(false)
const delitingId = ref(null)

async function create() {
    creating.value = true

    const [item, error] = await tryCatch(() => createItem(props.databaseId, props.collectionId, {}))

    if (error) {
        creating.value = false
        snackbar.error('Failed to create item', error)
        return
    }

    setTimeout(() => {
        creating.value = false
        snackbar.success('Item created')

        router.push({
            name: 'app-page',
            params: { name: 'item' },
            query: {
                databaseId: props.databaseId,
                collectionId: props.collectionId,
                itemId: item.id,
            },
        })
    }, 800)
}

async function destroy(item) {
    if (!(await dialog.confirm())) return

    delitingId.value = item.id

    const [, error] = await tryCatch(() =>
        destroyItem(props.databaseId, props.collectionId, item.id)
    )

    if (error) {
        delitingId.value = null
        snackbar.error('Failed to destroy item', error)
        return
    }

    items.value = items.value.filter((i) => i.id !== item.id)

    setTimeout(() => {
        delitingId.value = null
        snackbar.success('Item deleted')
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
                        :loading="creating"
                        @click="create"
                    >
                        Add new
                    </is-btn>
                </div>
            </is-card-head>

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
                    <is-card v-for="item in items" :key="item.id" class="group">
                        <is-card-content class="relative">
                            <pre v-text="item" />

                            <div
                                class="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100"
                            >
                                <is-btn
                                    v-if="database?._capabilities?.includes('item.destroy')"
                                    size="none"
                                    color="none"
                                    class="p-1 hover:bg-body-500"
                                    variant="text"
                                    :loading="delitingId === item.id"
                                    @click="destroy(item)"
                                >
                                    <is-icon name="heroicons:trash-solid" />
                                </is-btn>

                                <is-btn
                                    size="none"
                                    color="none"
                                    class="p-1 hover:bg-body-500"
                                    variant="text"
                                    :to="{
                                        name: 'app-page',
                                        params: { name: 'item' },
                                        query: {
                                            databaseId,
                                            collectionId,
                                            itemId: item.id,
                                        },
                                    }"
                                >
                                    <is-icon name="heroicons:eye-solid" />
                                </is-btn>
                            </div>
                        </is-card-content>
                    </is-card>

                    <CollectionPagination v-model="pagination" />
                </div>
            </is-card-content>
        </is-card>
    </div>
</template>
