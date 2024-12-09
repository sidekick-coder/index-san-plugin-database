<script setup>
import { computed } from 'vue'

const props = defineProps({
    property: {
        type: Object,
        default: () => ({}),
    },
})

const icon = computed(() => {
    if (props.property.icon) {
        return props.property.icon
    }

    if (props.property.type === 'text') {
        return 'heroicons:annotation'
    }

    if (props.property.type === 'boolean') {
        return 'heroicons:check-circle'
    }

    return 'heroicons:cube'
})
</script>

<template>
    <is-icon :name="icon" />
</template>
