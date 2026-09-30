<script setup>
import { computed, ref } from 'vue';
import HealthCareList from './data/HealthCareList.json'
import { normalize } from './search.js'

const datas = HealthCareList.list_items
const searchKeys = datas.map(normalize)
const search = ref(''); // Initialize search as a reactive reference

const filteredList = computed(() => {
    const query = normalize(search.value)
    return datas.filter((item, i) => {
        return searchKeys[i].includes(query);
    });
});

</script>

<template>
    <div class="row">
        <div class="card shadow-lg rounded min-vh-100">
            <div class="card-body mt-2">
                <input v-model="search" placeholder="Search" class="my-4 form-control">
                <div class="" v-for="(data, index) in filteredList" :key="index">
                    <div class="border-bottom text-dark">
                        <span class="">{{ index }}. </span> {{ data }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
