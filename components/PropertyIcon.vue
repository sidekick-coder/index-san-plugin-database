<script setup>
defineProps({
    property: {
        type: Object,
        default: () => ({}),
    },
})
</script>

<template>
    <is-icon :name="property.icon || 'heroicons:cube'" />
</template>
