<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { get, set } from 'app:utils'

import { listProperties } from '../services/property.js'

import ItemProperty from '../components/ItemProperty.vue'

const props = defineProps({
    databaseId: {
        type: String,
        required: true,
    },
    collectionId: {
        type: String,
        required: true,
    },
    itemId: {
        type: String,
        required: true,
    },
    database: {
        type: Object,
        required: true,
    },
    item: {
        type: Object,
        required: true,
    },
})

// database
const readonly = computed(() => !props.database._capabilities?.includes('item.update'))

// properties
const properties = ref([])

async function setProperties() {
    properties.value = await listProperties(props.databaseId, props.collectionId)
}

onMounted(setProperties)

// payload
const loading = ref(true)
const payload = ref({})

function setPayload() {
    loading.value = true

    properties.value.forEach((p) => {
        const value = get(props.item, p.value)

        set(payload.value, p.value, value)
    })

    setTimeout(() => {
        loading.value = false
    }, 800)
}

watch([properties, () => props.item], setPayload)
</script>
<template>
    <div class="p-4">
        <is-card v-if="payload" color="body-800">
            <is-card-head>
                <is-card-title> General </is-card-title>
            </is-card-head>
            <is-card-content class="flex flex-col gap-y-4">
                <item-property
                    v-for="p in properties"
                    :key="p.id"
                    :readonly="readonly"
                    :database-id
                    :collection-id
                    :property-id="p.id"
                    :item-id
                    :property="p"
                    :item="item"
                />
            </is-card-content>
        </is-card>
    </div>
</template>
