<script setup>
import { computed, watch, shallowRef } from 'vue'

import { useRouteQuery } from 'app:utils'

import ViewIcon from '../components/ViewIcon.vue'
import ViewGeneral from './ViewGeneral.vue'

import { useCollection } from '../composables/useCollection.js'
import { useDatabase } from '../composables/useDatabase.js'
import { useView } from '../composables/useView.js'

// general
const props = defineProps({
    databaseId: {
        type: String,
        required: true,
    },
    collectionId: {
        type: String,
        required: true,
    },
    viewId: {
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

// view
const viewId = computed(() => props.viewId)

const { view } = useView(databaseId, collectionId, viewId, {
    immediate: true,
    watch: true,
})

const loading = computed(() => !database.value || !collection.value || !view.value)

// Tab
const tab = useRouteQuery('tab', 'general')

const tabs = shallowRef([])

function setTabs() {
    tabs.value = [
        {
            label: 'General',
            value: 'general',
            component: ViewGeneral,
        },
    ]
}

watch(view, setTabs)
</script>

<template>
    <div v-if="loading" class="size-full flex items-center justify-center">
        <is-spinner />
    </div>

    <div v-else-if="collection">
        <is-card>
            <is-card-head>
                <view-icon :view class="mr-4 text-2xl" />

                <div>
                    <is-card-title>
                        {{ view.label }}
                    </is-card-title>

                    <is-card-subtitle v-if="view.description">
                        {{ view.description }}
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
                            :view-id
                            :view
                        />
                    </div>
                </template>
            </is-tabs>
        </is-card>
        <div></div>
    </div>
</template>
