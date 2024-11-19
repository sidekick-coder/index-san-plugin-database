<script setup>
import { useRoute } from 'vue-router'
import { computed, watch, shallowRef } from 'vue'

import { useRouteQuery } from 'app:utils'

import ItemIcon from '../components/ItemIcon.vue'
import ItemGeneral from './ItemGeneral.vue'

import { useCollection } from '../composables/useCollection.js'
import { useDatabase } from '../composables/useDatabase.js'
import { useItem } from '../composables/useItem.js'

// general
const route = useRoute()

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
})

// database
const databaseId = computed(() => props.databaseId)

const { database } = useDatabase(databaseId, {
    immediate: true,
    watch: true,
})

// collection
const collectionId = computed(() => props.collectionId)

const { collection } = useCollection(databaseId, collectionId, {
    immediate: true,
    watch: true,
})

// item
const itemId = computed(() => props.itemId)

const { item } = useItem(databaseId, collectionId, itemId, {
    immediate: true,
    watch: true,
})

const loading = computed(() => !database.value || !collection.value || !item.value)

// Tab
const tab = useRouteQuery('tab', 'general')

const tabs = shallowRef([])

function setTabs() {
    tabs.value = [
        {
            label: 'General',
            value: 'general',
            component: ItemGeneral,
        },
    ]
}

watch(item, setTabs)
</script>

<template>
    <div v-if="loading" class="size-full flex items-center justify-center">
        <is-spinner />
    </div>

    <div v-else-if="item">
        <is-card>
            <is-card-head>
                <item-icon :item class="mr-4 text-2xl" />

                <div>
                    <is-card-title>
                        {{ item.label || item.id || 'Item' }}
                    </is-card-title>

                    <is-card-subtitle v-if="item.description">
                        {{ item.description }}
                    </is-card-subtitle>
                </div>
            </is-card-head>

            <is-tabs v-model="tab" :items="tabs">
                <template #item="{ item: i }">
                    <div class="border-t border-body-500 bg-body-700">
                        <component
                            :is="i.component"
                            :database-id
                            :collection-id
                            :item-id
                            :collection
                            :database
                            :item
                        />
                    </div>
                </template>
            </is-tabs>
        </is-card>
        <div></div>
    </div>
</template>
