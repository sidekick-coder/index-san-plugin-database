<script setup>
import { onMounted, ref } from 'vue'

import PropertyDialog from '../components/PropertyDialog.vue'

import snackbar from 'app:snackbar'
import dialog from 'app:dialog'
import { tryCatch } from 'app:utils'

import { destroyProperty, listProperties } from '../services/property.js'

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

const loading = ref(false)
const items = ref([])
const fields = ref([
    {
        name: 'name',
        label: 'Name',
        value: 'label',
    },
    {
        name: 'description',
        label: 'Description',
        value: 'description',
    },
    {
        name: 'actions',
        class: 'max-w-40',
    },
])

async function load() {
    loading.value = true

    items.value = await listProperties(props.databaseId, props.collectionId)

    setTimeout(() => {
        loading.value = false
    }, 800)
}

onMounted(load)

// actions
const showDialog = ref(false)
const delitingId = ref(null)

function onNewProperty(property) {
    items.value.push(property)
}

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
        <is-card color="body-800">
            <is-card-head class="flex">
                <div class="flex-1">
                    <is-card-title> Properties </is-card-title>
                    <is-card-subtitle>Properties of the collection</is-card-subtitle>
                </div>

                <div class="flex gap-x-2">
                    <is-btn @click="load">
                        <is-icon name="heroicons:arrow-path" />
                    </is-btn>

                    <is-btn
                        v-if="database?._capabilities?.includes('property.create')"
                        @click="showDialog = true"
                    >
                        Add new
                    </is-btn>
                </div>
            </is-card-head>

            <property-dialog
                v-model="showDialog"
                :database-id="databaseId"
                :collection-id="collectionId"
                @submit="onNewProperty"
            />

            <is-data-table :items :fields :loading>
                <template #item-actions="{ item }">
                    <is-btn
                        v-if="database?._capabilities?.includes('property.destroy')"
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
                            params: { name: 'property' },
                            query: {
                                databaseId,
                                collectionId,
                                propertyId: item.id,
                            },
                        }"
                    >
                        <is-icon name="heroicons:eye-solid" />
                    </is-btn>
                </template>
            </is-data-table>
        </is-card>
    </div>
</template>
