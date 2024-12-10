<script setup>
import { ref, onMounted } from 'vue'
import { onHook } from 'app:hook'

import { listDatabases } from '../services/database.js'
import SidebarItem from './SidebarItem.vue'
import DatabaseNewDialog from './DatabaseNewDialog.vue'

const databases = ref([])

async function load() {
    databases.value = await listDatabases()
}

onMounted(load)

onHook('database:created', load)
onHook('database:updated', load)
onHook('database:deleted', load)

const dialog = ref(false)
</script>

<template>
    <div>
        <div class="flex gap-x-4 items-center px-4 py-4 border-b border-body-500">
            <is-icon name="heroicons:circle-stack-solid" class="text-xl" />
            <div class="font-bold">Databases</div>
            <is-btn
                class="ml-auto"
                size="none"
                variant="text"
                color="body-500"
                @click="dialog = true"
            >
                <is-icon name="heroicons:plus-16-solid" />
            </is-btn>
        </div>

        <database-new-dialog v-model="dialog" />

        <sidebar-item v-for="d in databases" :key="d.id" :database="d" />
    </div>
</template>
