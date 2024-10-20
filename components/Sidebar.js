import { ref, onMounted } from 'vue'
import SidebarItem from './SidebarItem.js'
import { listDatabases } from '../composables/listDatabases.js'
import { onHook } from 'app:hook'

export default {
    components: {
        SidebarItem,
    },
    setup() {
        const databases = ref([])

        async function load() {
            databases.value = await listDatabases()
        }

        onMounted(load)

        onHook('database:created', load)
        onHook('database:updated', load)
        onHook('database:deleted', load)

        return {
            databases,
        }
    },
    template: `
		<div>
			<div class="flex gap-x-4 items-center px-4 py-4 border-b border-body-500">
				<is-icon name="heroicons:circle-stack-solid" class="text-xl" />
				<div class="font-bold">Databases</div>
				<is-btn
					:to="{ name: 'app-page', params: { name: 'database-new' } }"
					class="ml-auto"
					size="none"
					variant="text"
					color="body-500"
				>
					<is-icon name="heroicons:plus-16-solid" />
				</is-btn>
			</div>

			<sidebar-item v-for="d in databases" :key="d.id" :database="d" />
		</div>
	`,
}
