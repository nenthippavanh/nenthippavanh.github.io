<script setup>
import { computed, ref, watch } from 'vue'
import { normalize } from '../search.js'
import WordItem from './WordItem.vue'

// Searchable list of word-list lines (General, Health Care, All Words).
const props = defineProps({
    items: { type: Array, required: true },
    pageSize: { type: Number, default: 200 },
})

const search = ref('')
const limit = ref(props.pageSize)

const searchKeys = computed(() => props.items.map(normalize))

const filteredList = computed(() => {
    const query = normalize(search.value.trim())
    return props.items
        .map((text, index) => ({ text, index }))
        .filter(({ index }) => searchKeys.value[index].includes(query))
})

const visibleList = computed(() => filteredList.value.slice(0, limit.value))

watch(search, () => { limit.value = props.pageSize })
</script>

<template>
    <div>
        <div class="search-bar pt-3 pb-2">
            <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input v-model="search" type="search" class="form-control" placeholder="検索 · ຄົ້ນຫາ · Search">
            </div>
            <div class="small text-body-secondary mt-1">{{ filteredList.length }} / {{ items.length }}</div>
        </div>

        <ul class="list-group list-group-flush">
            <WordItem v-for="item in visibleList" :key="item.index" :text="item.text" />
        </ul>
        <p v-if="!filteredList.length" class="text-body-secondary text-center py-4 mb-0">
            <i class="bi bi-emoji-neutral"></i> No results
        </p>

        <div v-if="visibleList.length < filteredList.length" class="text-center">
            <button type="button" class="btn btn-outline-secondary my-3" @click="limit += pageSize">
                Show more ({{ filteredList.length - visibleList.length }})
            </button>
        </div>
    </div>
</template>
