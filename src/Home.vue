<script setup>
import { computed, ref } from 'vue';
import GeneralList from './data/GeneralList.json'
import WaterSupplyList from './data/WaterSupplyList.json'



const datas = (GeneralList.list_items).concat(WaterSupplyList.list_items)
const search = ref(''); // Initialize search as a reactive reference

const filteredList = computed(() => {
    return datas.filter(item => {
        return item.toLowerCase().includes(search.value.toLowerCase());
    });
});

</script>

<template>
    <div class="row">
        <div class="card shadow-lg rounded min-vh-100">
            <div class="card-title mt-2">
                <h4 class="text-black-50 fw-bolder fst-italic">All Word</h4>
                <input v-model="search" placeholder="Search" class="form-control">
            </div>
            <div class="card-body mt-2">
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
