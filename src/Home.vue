<script setup>
import { computed, ref, watch } from 'vue';
import GeneralList from './data/GeneralList.json'
import WaterSupplyList from './data/WaterSupplyList.json'
import HealthCareList from './data/HealthCareList.json'
import { loadIndex } from './waterSupplyDictionary.js'
import { normalize } from './search.js'

const PAGE_SIZE = 200

const dictionaryWords = ref([])
loadIndex()
    .then(list => { dictionaryWords.value = list.map(e => [e.kana ? `${e.ja}（${e.kana}）` : e.ja, e.en, e.lo].join('　')) })
    .catch(() => {}) // the Water Supply tab shows the load error

const datas = computed(() => (GeneralList.list_items).concat(WaterSupplyList.list_items, HealthCareList.list_items, dictionaryWords.value))
const searchKeys = computed(() => datas.value.map(normalize))
const search = ref(''); // Initialize search as a reactive reference
const limit = ref(PAGE_SIZE)

const filteredList = computed(() => {
    const query = normalize(search.value)
    return datas.value.filter((item, i) => {
        return searchKeys.value[i].includes(query);
    });
});

const visibleList = computed(() => filteredList.value.slice(0, limit.value))

watch(search, () => { limit.value = PAGE_SIZE })

</script>

<template>
    <div class="row">
        <div class="card shadow-lg rounded min-vh-100">
            <div class="card-title mt-2">
                <h4 class="text-black-50 fw-bolder fst-italic">All Word</h4>
                <input v-model="search" placeholder="Search" class="form-control">
            </div>
            <div class="card-body mt-2">
                <div class="" v-for="(data, index) in visibleList" :key="index">
                    <div class="border-bottom text-dark">
                        <span class="">{{ index }}. </span> {{ data }}
                    </div>
                </div>
                <button v-if="visibleList.length < filteredList.length" type="button"
                    class="btn btn-outline-secondary my-3" @click="limit += PAGE_SIZE">
                    Show more ({{ filteredList.length - visibleList.length }})
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
