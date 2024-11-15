<script setup>
import { ref } from 'vue'

const props = defineProps({
    provider: {
        type: String,
        required: true,
    },
    databaseId: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['submit'])

const model = defineModel({
    type: Boolean,
})

const payload = ref({
    name: '',
    description: '',
})

function submit() {
    console.log('submit', payload.value)
}
</script>

<template>
    <is-dialog v-model="model">
        <is-card class="w-dvw max-w-md">
            <is-card-head>
                <is-card-title>Create collection</is-card-title>
            </is-card-head>

            <is-card-content class="flex flex-col gap-y-4">
                <is-text-field v-model="payload.name" label="Name" />
                <is-text-field v-model="payload.description" label="Description" />

                <template v-if="provider === 'entry'">
                    <is-text-field v-model="payload.path" label="Path" />
                </template>

                <div class="text-right">
                    <is-btn @click="submit">Create</is-btn>
                </div>
            </is-card-content>
        </is-card>
    </is-dialog>
</template>
