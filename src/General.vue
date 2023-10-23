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
    <div class="row">
        <div class="card shadow-lg rounded">
            <div class="card-body mt-2">
                <input v-model="search" placeholder="Search" class="my-4 form-control">
                <div class="" v-for="(data, index) in filteredList" :key="index">
                    <div class="bg-light border-bottom display-5">
                        <span class="text-danger fw">{{ index }}. </span> {{ data }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
