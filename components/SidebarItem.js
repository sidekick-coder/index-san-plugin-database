import { ref, watch, computed } from 'vue'

export default {
    props: ['database'],
    setup(props) {
        const show = ref(false)
        const collections = ref([])

        const icon = computed(() => {
            if (props.database.type === 'workspaceEntry') {
                return 'heroicons:folder-solid'
            }
            return 'heroicons:folder-solid'
        })

        function setCollections() {
            collections.value = props.database.collections
        }

        function onClick() {}

        watch(
            show,
            () => {
                if (!collections.value.length) setCollections()
            },
            { immediate: true }
        )

        return {
            show,
            collections,
            icon,

            onClick,
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
						<is-icon :name="icon" class="relative text-sm group-hover:opacity-0" />

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

			<div v-if="show">
				<is-list-item
						v-for="c in collections"
						:key="c.id"
						:to="{
							name: 'app-page',
							params: { name: 'database-collection' },
							query: { databaseId: database.id, collectionId: c.id }
						}"
						class="pl-10"
						exact
				>
					<div class="w-4">
						<is-icon :name="c.icon || 'heroicons:archive-box-20-solid'" class="text-sm" />
					</div>
					<div class="ml-4">
						{{ c.name }}
					</div>
				</is-list-item>
			</div>
	`,
}
