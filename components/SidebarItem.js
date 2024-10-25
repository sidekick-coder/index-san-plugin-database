import { useRouter, useRoute } from 'vue-router'
import { ref, watch, computed, onMounted } from 'vue'
import { listCollections } from '../composables/listCollections.js'

export default {
    props: ['database'],
    setup(props) {
        const router = useRouter()
        const route = useRoute()

        const show = ref(false)
        const collections = ref([])

        const icon = computed(() => {
            if (props.database.type === 'entry') {
                return 'heroicons:folder-solid'
            }

            if (props.database.type === 'notion') {
                return 'mage:notion'
            }

            return 'heroicons:circle-stack-16-solid'
        })

        async function setCollections() {
            collections.value = await listCollections(props.database.id)
        }

        function onClick() {
            router.push({
                name: 'app-page',
                params: { name: 'database' },
                query: { databaseId: props.database.id },
            })
        }

        watch(
            show,
            () => {
                if (!collections.value.length) setCollections()
            },
            { immediate: true }
        )

        onMounted(() => {
            show.value = route.query.databaseId === props.database.id
        })

        return {
            show,
            collections,
            icon,

            onClick,
            setCollections,
        }
    },
    template: `
			<is-list-item class="group" @click="onClick">
				<div class="w-6">
					<is-btn
						size="none"
						color="none"
						class="p-1 hover:bg-body-500 relative"
						variant="text"
						@click.stop="show = !show"
					>
						<is-icon :name="icon" class="relative group-hover:opacity-0" />

						<is-icon
							name="heroicons:chevron-right-solid"
							:class="show ? 'rotate-90' : ''"
							class="transition-all absolute  opacity-0 group-hover:opacity-100"
						/>
				
					</is-btn>
				</div>

				<div class="ml-4 text-sm grow">
					{{ database.name }}
				</div>

                <is-btn
                    size="none"
                    color="none"
                    class="p-1 hover:bg-body-500 relative opacity-0 group-hover:opacity-100"
                    variant="text"
                    @click.stop="setCollections"
                >
                    <is-icon
                        name="heroicons:arrow-path"
                    />
                </is-btn>

			</is-list-item>

			<div v-if="show">
				<is-list-item
						v-for="c in collections"
						:key="c.id"
						:to="{
							name: 'app-page',
							params: { name: 'database-item-list' },
							query: { databaseId: database.id, collectionId: c.id }
						}"
						class="pl-10"
						exact
				>
					<div class="w-6">
						<is-icon :name="c.icon || 'heroicons:archive-box-20-solid'" />
					</div>
					<div class="ml-4">
						{{ c.name }}
					</div>
				</is-list-item>
			</div>
	`,
}
