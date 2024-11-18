<script setup>
import { onMounted, ref } from 'vue'

import dialog from 'app:dialog'
import snackbar from 'app:snackbar'
import { tryCatch } from 'app:utils'

import { listCollections, destroyCollection } from '../services/collection.js'

import CollectionIcon from '../components/CollectionIcon.vue'
import CollectionDialog from '../components/CollectionDialog.vue'
import { useDatabase } from '../composables/useDatabase.js'

// general
const props = defineProps({
    databaseId: {
        type: String,
        required: true,
    },
})

// database
const { database, load } = useDatabase(props.databaseId)

onMounted(load)

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
        name: 'description',
        label: 'Description',
        value: 'description',
    },
    {
        name: 'actions',
        class: 'max-w-40',
    },
])

async function setItems() {
    loading.value = true

    items.value = await listCollections(props.databaseId)

    setTimeout(() => {
        loading.value = false
    }, 800)
}

onMounted(setItems)

// dialog
const showDialog = ref(false)

function onNewCollection() {
    setItems()
}

// action

async function destroy(collection) {
    if (!(await dialog.confirm())) return

    loading.value = true

    const [, error] = await tryCatch(() => destroyCollection(props.databaseId, collection._id))

    if (error) {
        snackbar.error(error.message)
        loading.value = false
        return
    }

    setTimeout(() => {
        loading.value = false
        snackbar.success('Collection deleted')
    }, 800)
}
</script>
<template>
    <div v-if="database" class="p-4">
        <is-card color="body-800">
            <is-card-head class="flex">
                <div class="flex-1">
                    <is-card-title>Collections</is-card-title>
                    <is-card-subtitle>Manage your collections</is-card-subtitle>
                </div>

                <div class="flex gap-x-2">
                    <is-btn @click="setItems">
                        <is-icon name="heroicons:arrow-path" />
                    </is-btn>

                    <is-btn
                        v-if="database?._capabilities?.includes('collection.create')"
                        @click="showDialog = true"
                    >
                        Add new
                    </is-btn>
                </div>
            </is-card-head>

            <collection-dialog
                v-model="showDialog"
                :database-id="props.databaseId"
                :provider="database.provider"
                :meta-fields="database._provider.collection?.meta_fields"
                @submit="onNewCollection"
            />

            <is-data-table :items :loading :fields>
                <template #item-name="{ value, item }">
                    <div class="flex items-center">
                        <collection-icon :collection="item" class="mr-2" />
                        <span>{{ value }}</span>
                    </div>
                </template>

                <template #item-actions="{ item }">
                    <is-btn
                        v-if="database?._capabilities?.includes('collection.destroy')"
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
                        :to="{
                            name: 'app-page',
                            params: { name: 'collection' },
                            query: { databaseId: props.databaseId, collectionId: item.id },
                        }"
                    >
                        <is-icon name="heroicons:eye-solid" />
                    </is-btn>
                </template>
            </is-data-table>
        </is-card>
    </div>
</template>
