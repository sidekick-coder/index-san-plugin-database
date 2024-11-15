<script setup>
defineProps({
    database: {
        type: Object,
        default: () => ({}),
    },
})
</script>

<template>
    <is-icon :name="database.icon || 'heroicons:circle-stack-16-solid'" />
</template>
