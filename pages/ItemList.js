import { useRoute, useRouter } from 'vue-router'
import { ref, computed, watch } from 'vue'
import { tryCatch } from 'app:utils'

import dialog from 'app:dialog'
import snackbar from 'app:snackbar'

import { showCollection } from '../composables/showCollection.js'
import { createItem } from '../composables/createItem.js'
import { listItems } from '../composables/listItems.js'
import { updateItem } from '../composables/updateItem.js'
import { destroyItem } from '../composables/destroyItem.js'

export default {
    setup() {
        const route = useRoute()
        const router = useRouter()
        const databaseId = computed(() => route.query.databaseId)
        const collectionId = computed(() => route.query.collectionId)

        const original = ref(null)
        const collection = ref(null)
        const saving = ref(false)

        async function load() {
            collection.value = await showCollection(databaseId.value, collectionId.value)
            original.value = JSON.parse(JSON.stringify(collection.value))
        }

        watch(collectionId, load, { immediate: true })

        // table
        // const fields = ref([])
        const items = ref([])
        const selected = ref([])

        const fields = computed(() => {
            const result = [
                {
                    name: '_checkbox',
                    class: 'flex-auto w-20 shrink-0',
                },
            ]

            if (items.value[0]) {
                Object.keys(items.value[0])
                    .toSorted()
                    .forEach((k) => {
                        result.push({
                            name: k,
                            label: k,
                            class: 'w-96 flex-auto shrink-0',
                        })
                    })
            }

            return result
        })

        const editableFields = computed(() => {
            return fields.value.filter((f) => {
                if (['_checkbox'].includes(f.name)) return

                return !f.name.startsWith('_')
            })
        })

        const readonlyFields = computed(() => {
            return fields.value.filter((f) => f.name !== '_checkbox' && f.name.startsWith('_'))
        })

        async function setItems() {
            items.value = await listItems(databaseId.value, collectionId.value)
        }

        watch(collection, setItems)

        // create
        async function addItem() {
            await createItem(databaseId.value, collectionId.value, {})

            await setItems()
        }

        async function setItem(itemId, payload) {
            const item = items.value.find((i) => i.id === itemId)

            Object.assign(item, payload)

            await updateItem(databaseId.value, collectionId.value, itemId, payload)
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
            
            <div class="w-full overflow-x-auto flex">
			    <is-data-table
                    :items="items"
                    :fields="fields"
                    :item-class="i => ['hover:bg-body-800', selected.includes(i._id) ? 'bg-body-800' : '']"
                    item-field-class="p-0"
                    class="w-auto min-w-full"
                >

				<template #item-_checkbox="{ item }">
					<div class="flex items-center justify-center size-full">
						<is-checkbox class="w-auto" v-model:multiple="selected" :item-value="item._id" />
					</div>
				</template>
				
                <template v-for="field in readonlyFields" :key="field.name" #['item-'+field.name]="{ item }">
					<div class="text-body-500 px-4 py-2">{{ item[field.name] }}</div>
				</template>

				<template v-for="field in editableFields" :key="field.name" #['item-'+field.name]="{ item }">
					<input
						:value="item[field.name]"
						class="bg-transparent size-full py-2 px-4 outline-none focus:bg-body-500"
						@change="setItem(item.id, { [field.name]: $event.target.value })"
					/>
				</template>

			</is-data-table>
            </div>
		</is-card>
	`,
}
