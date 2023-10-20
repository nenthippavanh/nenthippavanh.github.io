<script setup>
import { computed, ref } from 'vue';
import GeneralList from './data/GeneralList.json'

const datas = GeneralList.list_items
const search = ref(''); // Initialize search as a reactive reference

const filteredList = computed(() => {
    return datas.filter(item => {
        return item.toLowerCase().includes(search.value.toLowerCase());
    });
});

</script>

<template>
    <div class="row" id="test1">
        <div class="card shadow-lg rounded">
            <div class="card-body mt-2">
                <input v-model="search" placeholder="Search" class="my-4 form-control">
                <ul class="nav" v-for="(data, index) in filteredList" :key="index">
                    <li class="nav-item">
                       <span class="fw-bold">{{ index }}. </span> {{ data }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
