<script setup>
import { useRoute } from 'vue-router'
import { computed, watch, shallowRef } from 'vue'

import { useRouteQuery } from 'app:utils'

import DatabaseIcon from '../components/DatabaseIcon.vue'

import DatabaseGeneral from './DatabaseGeneral.vue'
import DatabaseSettings from './DatabaseSettings.vue'
import DatabaseCollections from './DatabaseCollections.vue'

import { useDatabase } from '../composables/useDatabase.js'

// general
const route = useRoute()

// database
const databaseId = computed(() => route.query.databaseId)
const { database, loading } = useDatabase(databaseId, { immediate: true, watch: true })

// Tab
const tab = useRouteQuery('tab', 'general')

const tabs = shallowRef([])

function setTabs() {
    tabs.value = [
        {
            label: 'General',
            value: 'general',
            component: DatabaseGeneral,
        },
    ]

    tabs.value.push({
        label: 'Collections',
        value: 'collections',
        component: DatabaseCollections,
    })

    tabs.value.push({
        label: 'Settings',
        value: 'settings',
        component: DatabaseSettings,
    })
}

watch(database, setTabs)
</script>

<template>
    <div v-if="loading" class="size-full flex items-center justify-center">
        <is-spinner />
    </div>

    <div v-else-if="database">
        <is-card>
            <is-card-head>
                <database-icon :database="database" class="mr-4 text-2xl" />

                <div>
                    <is-card-title>
                        {{ database.label }}
                    </is-card-title>

                    <is-card-subtitle v-if="database.description">
                        {{ database.description }}
                    </is-card-subtitle>
                </div>
            </is-card-head>

            <is-tabs v-model="tab" :items="tabs">
                <template #item="{ item }">
                    <div class="border-t border-body-500 bg-body-700">
                        <component :is="item.component" :database-id :database />
                    </div>
                </template>
            </is-tabs>
        </is-card>
        <div></div>
    </div>
</template>
