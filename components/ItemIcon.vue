<script setup>
defineProps({
    item: {
        type: Object,
        default: () => ({}),
    },
})
</script>

<template>
    <is-icon :name="item.icon || 'heroicons:document-text'" />
</template>
