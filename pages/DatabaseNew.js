import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createDatabase } from '../composables/createDatabase.js'

import snackbar from 'app:snackbar'

export default {
    setup() {
        const router = useRouter()

        const payload = ref({
            id: '',
            type: 'entry',
            name: '',
        })

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
					<is-text-field label="type" v-model="payload.type" readonly />
					
					<is-btn @click="submit" :disabled="!payload.id">Create</is-btn>
				</div>
			</is-card>
		</div>
	`,
}
