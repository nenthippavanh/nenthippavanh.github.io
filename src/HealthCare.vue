<script setup>
import HealthCareList from './data/HealthCareList.json'
import WordList from './components/WordList.vue'
</script>

<template>
    <WordList :items="HealthCareList.list_items" />
</template>
