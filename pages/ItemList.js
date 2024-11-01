import { useRoute } from 'vue-router'
import { ref, computed, watch } from 'vue'

import dialog from 'app:dialog'
import snackbar from 'app:snackbar'
import { tryCatch } from 'app:utils'

import { showCollection } from '../composables/showCollection.js'
import { createItem } from '../composables/createItem.js'
import { listItems } from '../composables/listItems.js'
import { updateItem } from '../composables/updateItem.js'
import { destroyItem } from '../composables/destroyItem.js'
import { listProperties } from '../composables/listProperties.js'

export default {
    setup() {
        const route = useRoute()
        const databaseId = computed(() => route.query.databaseId)
        const collectionId = computed(() => route.query.collectionId)

        const original = ref(null)
        const collection = ref(null)
        const saving = ref(false)

        async function setCollection() {
            collection.value = await showCollection(databaseId.value, collectionId.value)
            original.value = JSON.parse(JSON.stringify(collection.value))
        }

        watch(collectionId, setCollection, { immediate: true })

        // items
        const loading = ref(false)
        const fields = ref([])
        const items = ref([])
        const selected = ref([])

        const editableFields = computed(() => {
            return fields.value.filter((f) => {
                if (['_checkbox'].includes(f.name)) return

                return !f.readonly
            })
        })

        const readonlyFields = computed(() => {
            return fields.value.filter((f) => f.readonly)
        })

        async function setItems() {
            const [resonse, error] = await tryCatch(() =>
                listItems(databaseId.value, collectionId.value)
            )

            if (error) console.error(error)

            items.value = resonse || []
        }

        async function setFields() {
            fields.value = await listProperties(databaseId.value, collectionId.value)
            fields.value.sort((a, b) => (a.order || 99) - (b.order || 99))

            fields.value.unshift({
                name: '_checkbox',
                class: 'flex-none w-20',
            })
        }

        async function load() {
            loading.value = true
            items.value = []
            fields.value = []

            await Promise.allSettled([setItems(), setFields()])

            setTimeout(() => {
                loading.value = false
            }, 800)
        }

        watch([databaseId, collectionId], load, { immediate: true })

        // create
        async function addItem() {
            await createItem(databaseId.value, collectionId.value, {})

            await setItems()
        }

        async function setItem(itemId) {
            const item = items.value.find((i) => i.id === itemId)

            Object.assign(item)

            await updateItem(databaseId.value, collectionId.value, itemId)
        }

        // delete
        const deleting = ref(false)

        async function deleteSelected() {
            if (!(await dialog.confirm())) return

            deleting.value = true

            for await (const id of selected.value) {
                await destroyItem(databaseId.value, collectionId.value, id)
            }

            await load()

            selected.value = []

            setTimeout(() => {
                snackbar.success('Item(s) deleted')
                deleting.value = false
            }, 800)
        }

        return {
            saving,
            collection,
            original,
            selected,
            loading,

            fields,
            editableFields,
            readonlyFields,
            items,

            addItem,
            setItem,

            deleting,
            deleteSelected,
        }
    },
    template: `
		<is-card class="h-full">
			<is-card-head>
				<div class="flex-1">	
					<is-card-title>{{ collection?.name }}</is-card-title>
					<is-card-subtitle v-if="collection?.description">{{ original.description }}</is-card-subtitle>
				</div>
                <div class="flex gap-x-2">
				    <is-btn @click="deleteSelected" color="danger" :disabled="!selected.length" :loading="deleting">Delete</is-btn>
				    <is-btn @click="addItem">Add new</is-btn>
                </div>
			</is-card-head>
            
            <is-card-content
                    class="flex flex-col overflow-y-auto"
                    style="height: calc(100vh - 88px)"
            >
                <is-card v-if="loading" class="flex-1 flex items-center justify-center">
                    <is-card-content>
                        <is-spinner />
                    </is-card-content>
                </is-card>
                
                <is-card v-else-if="!items.length" class="flex-1 flex items-center justify-center">
                    <is-card-content>
                        No items found
                    </is-card-content>
                </is-card>

                <div v-else class="flex flex-col gap-y-2 over">
                   <is-card v-for="i in items" :key="i.id" class="bg-body-800">
                        <is-card-content>
                            <pre v-text="JSON.stringify(i, null, 4)" />
                        </is-card-content>
                    </is-card>
                </div>

            </is-card-content>
		</is-card>
	`,
}
