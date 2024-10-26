import { ref, watch } from 'vue'
import { listItems } from '../composables/listItems.js'
import { listProperties } from '../composables/listProperties.js'
import { debounce } from 'app:utils'
import { updateItem } from '../composables/updateItem.js'

export default {
    props: ['databaseId', 'collectionId'],
    setup(props) {
        const loading = ref(false)
        const fields = ref([])
        const items = ref([])

        async function setItems() {
            items.value = await listItems(props.databaseId, props.collectionId)
        }

        async function setFields() {
            fields.value = await listProperties(props.databaseId, props.collectionId)
            fields.value.sort((a, b) => (a.order || 99) - (b.order || 99))

            fields.value.unshift({
                name: '_checkbox',
                class: 'flex-none w-20',
            })
        }

        async function load() {
            loading.value = true
            items.value = []

            await Promise.allSettled([setFields(), setItems()])

            setTimeout(() => {
                loading.value = false
            }, 500)
        }

        const updateItemWithDebounce = debounce(updateItem, 500)

        async function update(id, field, value) {
            const item = items.value.find((i) => i._id === id)

            if (!item) return

            if (field.beforeSave) {
                value = field.beforeSave(value)
            }

            item[field.name] = value

            updateItemWithDebounce(props.databaseId, props.collectionId, id, {
                [field.name]: value,
            })
        }

        watch([() => props.databaseId, () => props.collectionId], load, { immediate: true })

        return {
            loading,
            fields,
            items,
            setItems,
            setFields,

            update,
        }
    },
    template: `
        <is-data-table :items :fields :loading>
            
            <template
                v-for="field in fields"
                v-slot:['item-'+field.name]="props"
            >
                <slot :name="'item-'+field.name" v-bind="props">
                    <component 
                        v-if="props.field.component"
                        :is="props.field.component"
                        :model-value="props.value"
                        @update:model-value="update(props.item._id, props.field, $event)"
                    />
                    <template v-else>
                        {{ props.value }}
                    </template>
                </slot>
            </template>

        </is-data-table>
    `,
}
