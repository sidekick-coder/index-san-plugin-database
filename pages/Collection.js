import { useRoute, useRouter } from 'vue-router'
import { ref, computed, watch } from 'vue'
import { tryCatch } from 'app:utils'

import dialog from 'app:dialog'
import snackbar from 'app:snackbar'

import { updateDatabase } from '../composables/updateDatabase.js'
import { destroyDatabase } from '../composables/destroyDatabase.js'
import { showCollection } from '../composables/showCollection.js'
import { createItem } from '../composables/createItem.js'
import { listItems } from '../composables/listItems.js'
import { updateItem } from '../composables/updateItem.js'

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

        async function submit() {
            saving.value = true

            const [, error] = await tryCatch(() => updateDatabase(databaseId.value, database.value))

            if (error) {
                snackbar.error(error.message)
                return
            }

            setTimeout(async () => {
                snackbar.success('Database updated')

                await load()

                saving.value = false
            }, 800)
        }

        async function destroy() {
            if (!(await dialog.confirm())) return

            const [, error] = await tryCatch(() => destroyDatabase(database.value.id))

            if (error) {
                snackbar.error(error.message)
                return
            }

            snackbar.success('Database deleted')

            router.push({ name: 'app-page', params: { name: 'databases' } })
        }

        // table
        const fields = ref([])
        const items = ref([])

        const editableFields = computed(() => {
            return fields.value.filter((f) => {
                if (['_checkbox', 'id'].includes(f.name)) return

                return true
            })
        })

        function setFields() {
            fields.value = collection.value.properties

            fields.value.unshift({
                name: '_checkbox',
                class: 'max-w-20',
            })
        }

        async function setItems() {
            items.value = await listItems(databaseId.value, collectionId.value)
        }

        watch(collection, setFields)
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

        return {
            saving,
            collection,
            original,

            fields,
            editableFields,
            items,

            addItem,
            setItem,

            submit,
            destroy,
        }
    },
    template: `
		<is-card class="h-full">
			<is-card-head>
				<div class="flex-1">	
					<is-card-title>{{ collection?.name }}</is-card-title>
					<is-card-subtitle v-if="collection?.description">{{ original.description }}</is-card-subtitle>
				</div>
					
				<is-btn @click="addItem">Add new</is-btn>
			</is-card-head>
			<is-data-table :items="items" :fields="fields" item-field-class="p-0">
				<template #item-_checkbox="{ item }">
					<div class="flex items-center justify-center">
						<is-checkbox class="w-auto" />
					</div>
				</template>
				<template #item-id="{ item }">
					<div class="text-body-500 px-4 py-2">{{ item.id }}</div>
				</template>

				<template v-for="field in editableFields" :key="field.name" #['item-'+field.name]="{ item }">
					<input
						:value="item[field.name]"
						class="bg-transparent min-w-full min-h-full py-2 px-4 outline-none focus:bg-body-500"
						@change="setItem(item.id, { [field.name]: $event.target.value })"
					/>
				</template>

			</is-data-table>
		</is-card>
	`,
}
