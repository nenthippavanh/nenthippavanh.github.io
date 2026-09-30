<script setup>
import GeneralList from './data/GeneralList.json'
import WordList from './components/WordList.vue'
</script>

<template>
    <WordList :items="GeneralList.list_items" />
</template>
