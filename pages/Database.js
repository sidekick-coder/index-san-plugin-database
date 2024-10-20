import { useRoute, useRouter } from 'vue-router'
import { ref, computed, watch } from 'vue'
import { tryCatch } from 'app:utils'

import dialog from 'app:dialog'
import snackbar from 'app:snackbar'

import { showDatabase } from '../composables/showDatabase.js'
import { updateDatabase } from '../composables/updateDatabase.js'
import { destroyDatabase } from '../composables/destroyDatabase.js'

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

        return {
            saving,
            database,
            original,

            submit,
            destroy,
        }
    },
    template: `
		<div class="p-5" v-if="database">

			<is-card>
				<is-card-head>
					<is-card-title>{{ original?.name }}</is-card-title>
				</is-card-head>
				<is-card-content class="flex flex-col gap-y-4">
					<is-text-field label="ID" :model-value="database.id" disabled />
					<is-text-field label="Type" :model-value="database.type" disabled />
					<is-text-field label="Name" v-model.lazy="database.name" />
					<is-btn @click="submit" :loading="saving">Save</is-btn>
					<is-btn @click="destroy" color="danger">Delete</is-btn>
				</is-card-content>
			</is-card>
		</div>
	`,
}
