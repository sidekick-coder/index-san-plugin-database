<script setup>
import { useRoute } from 'vue-router'
import { computed, watch, shallowRef } from 'vue'

import DatabaseIcon from '../components/DatabaseIcon.vue'

import DatabaseSingleGeneral from './DatabaseSingleGeneral.vue'
import DatabaseSingleSettings from './DatabaseSingleSettings.vue'

import { useDatabase } from '../composables/useDatabase.js'

// general
const route = useRoute()

// database
const databaseId = computed(() => route.query.databaseId)
const { id, database, loading, load } = useDatabase()

watch(
    databaseId,
    () => {
        id.value = databaseId.value

        load()
    },
    { immediate: true }
)

const tabs = shallowRef([])

function setTabs() {
    tabs.value = [
        {
            label: 'General',
            value: 'general',
            component: DatabaseSingleGeneral,
        },
    ]

    tabs.value.push({
        label: 'Collections',
        value: 'collections',
    })

    tabs.value.push({
        label: 'Settings',
        value: 'settings',
        component: DatabaseSingleSettings,
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

            <is-tabs :items="tabs">
                <template #item="{ item }">
                    <div class="border-t border-body-500 bg-body-700">
                        <component :is="item.component" :database-id />
                    </div>
                </template>
            </is-tabs>
        </is-card>
        <div></div>
    </div>
</template>
