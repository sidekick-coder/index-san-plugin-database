<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import snackbar from 'app:snackbar'
import dialog from 'app:dialog'
import { tryCatch } from 'app:utils'

import { createView, listViews, destroyView } from '../services/view.js'

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
const fields = ref([
    {
        name: 'name',
        label: 'Name',
        value: 'label',
    },
    {
        name: 'component',
        label: 'Component',
        value: 'component',
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

    items.value = await listViews(props.databaseId, props.collectionId)

    setTimeout(() => {
        loading.value = false
    }, 800)
}

onMounted(load)

// actions
const delitingId = ref(null)
const creating = ref(false)

async function create() {
    creating.value = true

    const view = await createView(props.databaseId, props.collectionId, { name: 'New view' })

    router.push({
        name: 'app-page',
        params: { name: 'view' },
        query: {
            databaseId: props.databaseId,
            collectionId: props.collectionId,
            viewId: view.id,
        },
    })

    setTimeout(() => {
        creating.value = false
    }, 800)
}

async function destroy(view) {
    if (!(await dialog.confirm())) return

    delitingId.value = view.id

    const [, error] = await tryCatch(() =>
        destroyView(props.databaseId, props.collectionId, view.id)
    )

    if (error) {
        delitingId.value = null
        snackbar.error('Failed to destroy view', error)
        return
    }

    setTimeout(() => {
        delitingId.value = null
        snackbar.success('View deleted')
        items.value = items.value.filter((item) => item.id !== view.id)
    }, 800)
}
</script>
<template>
    <div class="p-4">
        <is-card color="body-800">
            <is-card-head class="flex">
                <div class="flex-1">
                    <is-card-title> Views </is-card-title>
                    <is-card-subtitle>Views of the collection</is-card-subtitle>
                </div>

                <div class="flex gap-x-2">
                    <is-btn @click="load">
                        <is-icon name="heroicons:arrow-path" />
                    </is-btn>

                    <is-btn :loading="creating" @click="create"> Add new </is-btn>
                </div>
            </is-card-head>

            <is-data-table :items :fields :loading>
                <template #item-actions="{ item }">
                    <is-btn
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
                            params: { name: 'view' },
                            query: {
                                databaseId: databaseId,
                                collectionId: collectionId,
                                viewId: item.id,
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
