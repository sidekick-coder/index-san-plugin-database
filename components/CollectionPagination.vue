<script setup>
const model = defineModel({
    type: Object,
    default: () => ({}),
})
</script>

<template>
    <is-pagination
        v-if="model.type === 'page' && model.last_page > 1"
        v-model="model.page"
        :total="model.last_page"
        class="py-4"
        color="body-500"
    />
</template>
