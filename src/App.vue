<script setup>
import { computed,ref } from 'vue';
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import listItems from './data/List.json'

const datas = listItems
const search = ref(''); // Initialize search as a reactive reference

const filteredList = computed(() => {
  return datas.list_items.filter(item => {
    return item.toLowerCase().includes(search.value.toLowerCase());
  });
});

</script>

<template>
  <div class="min-vh-100 min-vw-100 " style="font-family: Noto Sans Lao;">
    <div class="container">
      <div class="row">
        <div class="">
          <input v-model="search" placeholder="Search" class="my-4 form-control">
          <ul class="nav" v-for="(data,index) in filteredList" :key="index">
              <li class="nav-item">
                  {{ data }}
              </li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>

</style>
