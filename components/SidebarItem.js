import { ref } from 'vue'
import { drive } from 'app:drive'

export default {
	props: ['database'],
	setup() {
		
		const show = ref(false)

		function onClick(){}

		return {
			show,
			onClick
		}
	},
	template: `
			<is-list-item class="group" @click="onClick">
				<div class="w-4">
					<is-btn
						size="none"
						color="none"
						class="p-1 hover:bg-body-500 relative"
						variant="text"
						@click.stop="show = !show"
					>
						<is-icon name="heroicons:circle-stack-16-solid" class="relative text-sm group-hover:opacity-0" />

						<is-icon
							name="heroicons:chevron-right-solid"
							:class="show ? 'rotate-90' : ''"
							class="transition-all absolute  opacity-0 group-hover:opacity-100 text-sm"
						/>
				
					</is-btn>
				</div>

				<div class="ml-4 text-sm">
					{{ database.name }}
				</div>
			</is-list-item>
	`
}
