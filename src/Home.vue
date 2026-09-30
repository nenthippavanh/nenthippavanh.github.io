<script setup>
import { computed, ref } from 'vue';
import GeneralList from './data/GeneralList.json'
import WaterSupplyList from './data/WaterSupplyList.json'
import HealthCareList from './data/HealthCareList.json'
import { loadIndex } from './waterSupplyDictionary.js'
import WordList from './components/WordList.vue'

const dictionaryWords = ref([])
loadIndex()
    .then(list => { dictionaryWords.value = list.map(e => [e.kana ? `${e.ja}（${e.kana}）` : e.ja, e.en, e.lo].join('　')) })
    .catch(() => {}) // the Water Supply tab shows the load error

const datas = computed(() => (GeneralList.list_items).concat(WaterSupplyList.list_items, HealthCareList.list_items, dictionaryWords.value))
</script>

<template>
    <WordList :items="datas" />
</template>
