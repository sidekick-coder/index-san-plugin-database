<script setup>
import { computed } from 'vue'

const props = defineProps({
    view: {
        type: Object,
        default: () => ({}),
    },
})

const icon = computed(() => {
    if (props.view.icon) {
        return props.view.icon
    }

    if (props.view.component === 'database-table') {
        return 'mdi:table'
    }

    return 'heroicons:document-text'
})
</script>

<template>
    <is-icon :name="icon" />
</template>
