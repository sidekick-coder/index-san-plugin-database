<script setup>
import { ref, watch, computed } from 'vue'

import snackbar from 'app:snackbar'
import dialog from 'app:dialog'

import { tryCatch, copy } from 'app:utils'

import { updateView } from '../services/view.js'
import { listProperties } from '../services/property.js'

import PropertyIcon from '../components/PropertyIcon.vue'

const props = defineProps({
    databaseId: {
        type: String,
        required: true,
    },
    collectionId: {
        type: String,
        required: true,
    },
    viewId: {
        type: String,
        required: true,
    },
    view: {
        type: Object,
        required: true,
    },
})

// properties
const properties = ref([])

async function setProperties() {
    properties.value = await listProperties(props.databaseId, props.collectionId)
}

watch(() => props.collectionId, setProperties, { immediate: true })

// payload
const loading = ref(true)
const items = ref([])
const itemsFormated = computed(() => {
    const result = items.value.map((i) => ({
        ...i,
        property: properties.value.find((p) => p.id === i.property_id),
    }))

    result.sort((a, b) => (a.order || 999) - (b.order || 999))

    return result
})
const fields = ref([
    {
        name: 'property',
        label: 'Property',
        value: 'property.name',
    },
    {
        name: 'actions',
        class: 'max-w-40',
    },
])

function setItems() {
    const isChanged = JSON.stringify(props.view.properties) !== JSON.stringify(items.value)

    if (!isChanged) return

    loading.value = true

    items.value = props.view.properties ? copy(props.view.properties) : []

    setTimeout(() => {
        loading.value = false
    }, 800)
}

watch(() => props.view, setItems, { immediate: true, deep: true })

// actions
const editDialog = ref(false)
const editItem = ref(null)
const editIndex = ref(null)
const saving = ref(false)

function edit(item) {
    const index = items.value.findIndex((i) => i.id === item.id)

    editItem.value = copy(item)
    editIndex.value = index
    editDialog.value = true
}

async function saveEdit() {
    saving.value = true

    items.value[editIndex.value] = editItem.value

    await save()

    setTimeout(() => {
        saving.value = false
        editDialog.value = false
    }, 800)
}

watch(editDialog, (value) => {
    if (!value) {
        editItem.value = null
        editIndex.value = null
    }
})

async function save() {
    const [, error] = await tryCatch(() =>
        updateView(props.databaseId, props.collectionId, props.viewId, {
            properties: items.value,
        })
    )

    if (error) {
        console.error(error)
        setItems()
        return
    }
}

async function addProperty(property) {
    const id = window.crypto.randomUUID()

    items.value.push({
        id: id,
        property_id: property.id,
    })

    await save()
}

async function destroy(item) {
    const index = items.value.findIndex((i) => i.id === item.id)

    if (index === -1) return

    items.value.splice(index, 1)

    await save()
}
</script>
<template>
    <div class="p-4">
        <is-card color="body-800">
            <is-card-head class="flex">
                <div class="flex-1">
                    <is-card-title>Properties</is-card-title>
                    <is-card-subtitle>Manage view properties</is-card-subtitle>
                </div>

                <div class="flex gap-x-2">
                    <is-btn @click="setItems">
                        <is-icon name="heroicons:arrow-path" />
                    </is-btn>

                    <is-menu>
                        <template #activator="{ attrs }">
                            <is-btn v-bind="attrs"> Add new </is-btn>
                        </template>

                        <is-card class="w-96">
                            <is-list-item
                                v-for="property in properties"
                                :key="property.id"
                                @click="addProperty(property)"
                            >
                                <property-icon :property="property" />

                                <div class="ml-4">
                                    {{ property.label }}
                                </div>
                            </is-list-item>
                        </is-card>
                    </is-menu>
                </div>
            </is-card-head>
            <is-data-table :items="itemsFormated" :fields :loading>
                <template #item-actions="{ item }">
                    <is-btn
                        size="none"
                        color="none"
                        class="p-1 hover:bg-body-500"
                        variant="text"
                        @click="destroy(item)"
                    >
                        <is-icon name="heroicons:trash-solid" />
                    </is-btn>

                    <is-btn
                        size="none"
                        color="none"
                        class="p-1 hover:bg-body-500"
                        variant="text"
                        @click="edit(item)"
                    >
                        <is-icon name="heroicons:pencil-20-solid" />
                    </is-btn>
                </template>
            </is-data-table>
        </is-card>

        <is-dialog v-model="editDialog">
            <is-card>
                <is-card-head>
                    <is-card-title>Edit property</is-card-title>
                </is-card-head>

                <is-card-content class="flex flex-col gap-y-4">
                    <is-text-field v-model.number="editItem.order" label="Order" type="number" />
                    <is-text-field v-model.number="editItem.width" label="Width" type="number" />

                    <is-btn :loading="saving" @click="saveEdit">Save</is-btn>
                </is-card-content>
            </is-card>
        </is-dialog>
    </div>
</template>
