<script setup>
defineProps({
    collection: {
        type: Object,
        default: () => ({}),
    },
})
</script>

<template>
    <is-icon :name="collection.icon || 'heroicons:circle-stack-16-solid'" />
</template>
