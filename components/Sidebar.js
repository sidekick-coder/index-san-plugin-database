import { ref } from 'vue'
import SidebarItem from './SidebarItem.js'

export default {
	components: {
		SidebarItem
	},
	setup(){
		const databases = ref([
			{
				id: 'local',
				type: 'entry',
				name: 'Local'
			},
			{
				id: 'notion-personal',
				type: 'notion',
				name: 'Notion (personal)'
			},
			{
				id: 'notion-work',
				type: 'notion',
				name: 'Notion (work)'
			}
		])

		return {
			databases
		}
	},
	template: `
		<div>
			<div class="flex gap-x-4 items-center px-4 py-4 border-b border-body-500">
				<is-icon name="heroicons:circle-stack-solid" class="text-xl" />
				<div class="font-bold">Database</div>
			</div>

			<sidebar-item v-for="d in databases" :key="d.id" :database="d" />
		</div>
	`
}
