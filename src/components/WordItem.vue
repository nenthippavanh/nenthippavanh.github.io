<script setup>
import { computed } from 'vue'
import { parseWord } from '../wordFormat.js'
import WordText from './WordText.vue'

// One line of a word list: Japanese (with reading) on top, Lao / notes below.
const props = defineProps({ text: { type: String, required: true } })
const word = computed(() => parseWord(props.text))
</script>

<template>
    <li class="list-group-item py-2" :class="{ 'word-heading': word.heading }">
        <div class="word-jp"><WordText :segments="word.jp" /></div>
        <div v-if="word.meaning.length" class="word-meaning"><WordText :segments="word.meaning" /></div>
    </li>
</template>
