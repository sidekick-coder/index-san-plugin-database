import { useRoute, useRouter } from 'vue-router'
import { ref, computed, watch } from 'vue'
import { tryCatch } from 'app:utils'

import dialog from 'app:dialog'
import snackbar from 'app:snackbar'

import { showDatabase } from '../composables/showDatabase.js'
import { updateDatabase } from '../composables/updateDatabase.js'
import { destroyDatabase } from '../composables/destroyDatabase.js'
import { syncDatabase } from '../composables/syncDatabase.js'

export default {
    setup() {
        const route = useRoute()
        const router = useRouter()
        const databaseId = computed(() => route.query.databaseId)
        const original = ref(null)
        const database = ref(null)
        const saving = ref(false)

        async function load() {
            database.value = await showDatabase(databaseId.value)
            original.value = JSON.parse(JSON.stringify(database.value))
        }

        watch(databaseId, load, { immediate: true })

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

        // sync
        const syncing = ref(false)

        async function sync() {
            syncing.value = true

            await syncDatabase(databaseId.value)

            setTimeout(() => {
                snackbar.success('Database synced')
                syncing.value = false
            }, 800)
        }

        return {
            saving,
            database,
            original,

            submit,
            destroy,

            syncing,
            sync,
        }
    },
    template: `
		<div class="p-5 flex flex-col gap-y-5" v-if="database">
			<is-card>
				<is-card-head>
					<is-card-title>Data</is-card-title>
				</is-card-head>
				<is-card-content class="flex flex-col gap-y-4">
					<is-text-field label="ID" :model-value="database.id" disabled />
					<is-text-field label="Type" :model-value="database.type" disabled />
					<is-text-field label="Name" v-model.lazy="database.name" />
				</is-card-content>
				<is-card-content >
					<is-btn @click="submit" :loading="saving">Save</is-btn>
				</is-card-content>
			</is-card>

   			<is-card v-if="database.type === 'notion'">
				<is-card-head>
					<is-card-title>Notion</is-card-title>
				</is-card-head>

				<is-card-content class="flex flex-col gap-y-4">
					<is-text-field label="Notion key" v-model="database.notion_key" />
				</is-card-content>
				<is-card-content class="flex gap-2">
					<is-btn @click="sync" :loading="syncing">Sync</is-btn>
					<is-btn @click="submit" :loading="saving">Save</is-btn>
				</is-card-content>
			</is-card>

   			<is-card>
				<is-card-head class="flex-col items-start">
					<is-card-title>Delete</is-card-title>
					<is-card-subtitle>This will delete database declaration only, data will be keeped</is-card-subtitle>
				</is-card-head>

				<is-card-content>
					<is-btn @click="destroy" color="danger">Delete database</is-btn>
				</is-card-content>
			</is-card>
		</div>
	`,
}
