<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { listItems, destroyItem, createItem } from '../services/item.js'
import { listProperties } from '../services/property.js'
import { useDatabase } from '../composables/useDatabase.js'
import { useCollection } from '../composables/useCollection.js'

import dialog from 'app:dialog'
import snackbar from 'app:snackbar'

import CollectionPagination from './CollectionPagination.vue'
import CollectionIcon from './CollectionIcon.vue'

import PropertyIcon from './PropertyIcon.vue'

import ItemPropertyValue from './ItemPropertyValue.vue'
import ItemDialog from './ItemDialog.vue'

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
    hideTitle: {
        type: Boolean,
        default: false,
    },
    hideHead: {
        type: Boolean,
        default: false,
    },
})

const { database } = useDatabase(props.databaseId, {
    immediate: true,
})

const { collection } = useCollection(props.databaseId, props.collectionId, {
    immediate: true,
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

async function refresh() {
    pagination.value.page = 1

    await setItems()
}

async function setFields() {
    const response = await listProperties(props.databaseId, props.collectionId)

    allProperties.value = response
}

watch(() => pagination.value.page, setItems, { immediate: true })

onMounted(setFields)
// actions

const showDialog = ref(false)
const editedItemId = ref(null)
const delitingId = ref(null)
const creating = ref(false)

async function destroy(item) {
    delitingId.value = item.id

    if (!(await dialog.confirm())) {
        delitingId.value = null
        return
    }

    await destroyItem(props.databaseId, props.collectionId, item.id)

    setTimeout(() => {
        delitingId.value = null
        items.value = items.value.filter((i) => i.id !== item.id)
        snackbar.success('Item destroyed')
    }, 500)
}

function edit(item) {
    editedItemId.value = item.id

    showDialog.value = true
}

async function create() {
    creating.value = true

    const item = await createItem(props.databaseId, props.collectionId, {})

    items.value.push(item)

    edit(item)

    setTimeout(() => {
        creating.value = false
    }, 500)
}
</script>

<template>
    <is-card color="body-800" class="w-full border-x border-t border-body-500">
        <is-card-head v-if="!hideHead" class="flex">
            <div class="flex-1 flex items-center gap-x-2">
                <template v-if="collection && !hideTitle">
                    <CollectionIcon :collection="collection" />

                    <is-card-title> {{ collection.label }}</is-card-title>
                </template>
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

        <item-dialog
            v-if="editedItemId"
            v-model="showDialog"
            :database-id
            :collection-id
            :item-id="editedItemId"
        />

        <is-data-table :loading :fields :items item-class="group" item-field-class="p-0">
            <template #field="{ field }">
                <div class="flex items-center h-full">
                    <PropertyIcon :property="field" />
                    <span class="ml-2">{{ field.label }}</span>
                </div>
            </template>

            <template
                v-for="field in fields"
                #[`item-${field.id}`]="{ item, fieldIndex }"
                :key="field.id"
            >
                <div class="size-full flex">
                    <ItemPropertyValue
                        :database-id="databaseId"
                        :collection-id="collectionId"
                        :item-id="item.id"
                        :property-id="field.id"
                        :property="field"
                        :options="{ initial: item }"
                    />

                    <div
                        v-if="fieldIndex === fields.length - 1"
                        class="flex items-center justify-end shrink-0 h-full px-4"
                        :class="delitingId === item.id ? '' : 'opacity-0 group-hover:opacity-100'"
                    >
                        <is-btn
                            v-if="database?._capabilities?.includes('item.update')"
                            size="none"
                            color="none"
                            class="size-8 hover:bg-body-500"
                            variant="text"
                            @click="edit(item)"
                        >
                            <is-icon name="heroicons:pencil-solid" />
                        </is-btn>

                        <is-btn
                            v-if="database?._capabilities?.includes('item.destroy')"
                            size="none"
                            color="none"
                            class="size-8 hover:bg-body-500"
                            variant="text"
                            :loading="delitingId === item.id"
                            @click="destroy(item)"
                        >
                            <is-icon name="heroicons:trash-solid" />
                        </is-btn>
                    </div>
                </div>
            </template>
        </is-data-table>

        <CollectionPagination v-model="pagination" />
    </is-card>
</template>
