<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'

import { showDatabase } from '../composables/showDatabase.js'

// general
const route = useRoute()

// database
const databaseId = computed(() => route.query.databaseId)
const loading = ref(true)
const database = ref()

async function setDatabase() {
    loading.value = true

    database.value = await showDatabase(databaseId.value)

    setTimeout(() => {
        loading.value = false
    }, 1000)
}

onMounted(setDatabase)
</script>

<template>
    <div v-if="loading" class="size-full flex items-center justify-center">
        <is-spinner />
    </div>

    <div v-else class="py-5">
        <div class="flex -mx-4">
            <div class="w-4/12 px-4">
                <is-card>
                    <h1>{{ database.label }}</h1>
                </is-card>
            </div>
            <div class="w-8/12 px-4">
                <is-card>sections</is-card>
            </div>
        </div>
    </div>
</template>
