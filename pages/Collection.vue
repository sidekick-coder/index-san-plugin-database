<script setup>
import { useRoute } from 'vue-router'
import { computed, watch, shallowRef } from 'vue'

import { useRouteQuery } from 'app:utils'

import CollectionIcon from '../components/CollectionIcon.vue'
import CollectionGeneral from './CollectionGeneral.vue'
import CollectionMetadata from './CollectionMetadata.vue'
import CollectionProperties from './CollectionProperties.vue'
import CollectionData from './CollectionData.vue'

import { useCollection } from '../composables/useCollection.js'
import { useDatabase } from '../composables/useDatabase.js'
// general
const route = useRoute()

// database
const databaseId = computed(() => route.query.databaseId)

const { database } = useDatabase(databaseId, { immediate: true })

// collection
const collectionId = computed(() => route.query.collectionId)

const { collection, load, loading } = useCollection(databaseId, collectionId)

watch(collectionId, load, { immediate: true })

// Tab
const tab = useRouteQuery('tab', 'general')

const tabs = shallowRef([])

function setTabs() {
    tabs.value = [
        {
            label: 'General',
            value: 'general',
            component: CollectionGeneral,
        },
        {
            label: 'Data',
            value: 'data',
            component: CollectionData,
        },
        {
            label: 'Metadata',
            value: 'metadata',
            component: CollectionMetadata,
        },
        {
            label: 'Properties',
            value: 'properties',
            component: CollectionProperties,
        },
    ]
}

watch(collection, setTabs)
</script>

<template>
    <div v-if="loading" class="size-full flex items-center justify-center">
        <is-spinner />
    </div>

    <div v-else-if="collection">
        <is-card>
            <is-card-head>
                <collection-icon :collection class="mr-4 text-2xl" />

                <div>
                    <is-card-title>
                        {{ collection.label }}
                    </is-card-title>

                    <is-card-subtitle v-if="collection.description">
                        {{ collection.description }}
                    </is-card-subtitle>
                </div>
            </is-card-head>

            <is-tabs v-model="tab" :items="tabs">
                <template #item="{ item }">
                    <div
                        class="border-t border-body-500 bg-body-700 overflow-y-auto"
                        style="height: calc(100dvh - 80px - 42px)"
                    >
                        <component
                            :is="item.component"
                            :database-id
                            :collection-id
                            :collection
                            :database
                            :readonly="!database?._capabilities?.includes('collection.update')"
                        />
                    </div>
                </template>
            </is-tabs>
        </is-card>
        <div></div>
    </div>
</template>
