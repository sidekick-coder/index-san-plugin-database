<script setup>
import { useRoute } from 'vue-router'
import { computed, watch, shallowRef } from 'vue'

import { useRouteQuery } from 'app:utils'

import PropertyIcon from '../components/PropertyIcon.vue'
import PropertyGeneral from './PropertyGeneral.vue'

import { useCollection } from '../composables/useCollection.js'
import { useDatabase } from '../composables/useDatabase.js'
import { useProperty } from '../composables/useProperty.js'
// general
const route = useRoute()

// database
const databaseId = computed(() => route.query.databaseId)

const { database } = useDatabase(databaseId, {
    immediate: true,
    watch: true,
})

// collection
const collectionId = computed(() => route.query.collectionId)

const { collection } = useCollection(databaseId, collectionId, {
    immediate: true,
    watch: true,
})

// property
const propertyId = computed(() => route.query.propertyId)

const { property } = useProperty(databaseId, collectionId, propertyId, {
    immediate: true,
    watch: true,
})

const loading = computed(() => !database.value || !collection.value || !property.value)

// Tab
const tab = useRouteQuery('tab', 'general')

const tabs = shallowRef([])

function setTabs() {
    tabs.value = [
        {
            label: 'General',
            value: 'general',
            component: PropertyGeneral,
        },
    ]
}

watch(property, setTabs)
</script>

<template>
    <div v-if="loading" class="size-full flex items-center justify-center">
        <is-spinner />
    </div>

    <div v-else-if="collection">
        <is-card>
            <is-card-head>
                <property-icon :property class="mr-4 text-2xl" />

                <div>
                    <is-card-title>
                        {{ property.label }}
                    </is-card-title>

                    <is-card-subtitle v-if="property.description">
                        {{ property.description }}
                    </is-card-subtitle>
                </div>
            </is-card-head>

            <is-tabs v-model="tab" :items="tabs">
                <template #item="{ item }">
                    <div class="border-t border-body-500 bg-body-700">
                        <component
                            :is="item.component"
                            :database-id
                            :collection-id
                            :property-id
                            :collection
                            :database
                            :property
                        />
                    </div>
                </template>
            </is-tabs>
        </is-card>
        <div></div>
    </div>
</template>
