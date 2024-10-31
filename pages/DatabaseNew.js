import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createDatabase } from '../composables/createDatabase.js'

import snackbar from 'app:snackbar'
import { listProviders } from '../composables/listProviders.js'

export default {
    setup() {
        const router = useRouter()

        const payload = ref({
            id: '',
            type: 'entry',
            name: '',
        })

        // providers
        const providers = ref([])

        async function setProviders() {
            providers.value = await listProviders()
        }

        onMounted(setProviders)

        async function submit() {
            try {
                const database = await createDatabase(payload.value)

                snackbar.success('Database created')

                router.push({
                    name: 'app-page',
                    params: { name: 'database' },
                    query: { databaseId: database.id },
                })
            } catch (e) {
                snackbar.error(e.message)
            }
        }

        return {
            payload,
            providers,

            submit,
        }
    },
    template: `
		<div class="p-5">
			<is-card class="px-4 py-4">
				<div class="text-2xl font-bold mb-4">Create database</div>

				<div class="flex flex-col gap-y-4">
					<is-text-field label="ID" v-model="payload.id" />
					<is-text-field label="Name" v-model="payload.name" />
					<is-text-field label="Icon" v-model="payload.icon" />

					<is-select label="Provider" v-model="payload.provider" :options="providers" label-key="id" value-key="id" />
					
					<is-text-field v-if="payload.type === 'api-provider' " label="API provider id" v-model="payload.provider_id" />

					<is-btn @click="submit" :disabled="!payload.id">Create</is-btn>
				</div>
			</is-card>
		</div>
	`,
}
