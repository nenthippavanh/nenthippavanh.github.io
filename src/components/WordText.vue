<script setup>
// Renders text segments from parseWord(), showing readings in a smaller, muted style.
defineProps({ segments: { type: Array, required: true } })
</script>

<template>
    <template v-for="(s, i) in segments" :key="i">
        <span v-if="s.reading" class="word-reading">{{ s.text }}</span>
        <template v-else>{{ s.text }}</template>
    </template>
</template>
