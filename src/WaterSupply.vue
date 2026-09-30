<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue';
import WaterSupplyList from './data/WaterSupplyList.json'
import { loadDetail, loadIndex } from './waterSupplyDictionary.js'
import { normalize } from './search.js'

const PAGE_SIZE = 100
const LANGS = [
    { key: 'ja', label: '日本語', related: '関連用語' },
    { key: 'lo', label: 'ພາສາລາວ', related: 'ຄຳສັບທີ່ກ່ຽວຂ້ອງ' },
    { key: 'th', label: 'ภาษาไทย', related: 'คำศัพท์ที่เกี่ยวข้อง' },
]

const datas = WaterSupplyList.list_items
const entries = ref([])
const loadError = ref(false)
const search = ref(''); // Initialize search as a reactive reference
const limit = ref(PAGE_SIZE)
const openId = ref(null)
const details = reactive({}) // entry id -> detail, or 'error'

loadIndex()
    .then((list) => { entries.value = list })
    .catch(() => { loadError.value = true })

const query = computed(() => normalize(search.value.trim()))

const filteredList = computed(() => {
    return datas.filter(item => {
        return normalize(item).includes(query.value);
    });
});

// Exact headword matches first, then headwords starting with the query.
const filteredEntries = computed(() => {
    const q = query.value
    if (!q) return entries.value
    const rank = (entry) => entry.keys.includes(q) ? 0 : entry.keys.some(key => key.startsWith(q)) ? 1 : 2
    return entries.value
        .filter(entry => entry.keys.some(key => key.includes(q)))
        .map(entry => ({ entry, rank: rank(entry) }))
        .sort((a, b) => a.rank - b.rank)
        .map(({ entry }) => entry)
});

const visibleEntries = computed(() => filteredEntries.value.slice(0, limit.value))

watch(search, () => { limit.value = PAGE_SIZE })

function fetchDetail(id) {
    if (details[id] && details[id] !== 'error') return
    delete details[id]
    loadDetail(id)
        .then((detail) => { details[id] = detail ?? 'error' })
        .catch(() => { details[id] = 'error' })
}

function toggle(id) {
    openId.value = openId.value === id ? null : id
    if (openId.value) fetchDetail(id)
}

function sections(entry) {
    const detail = details[entry.id]
    return LANGS.filter(lang => entry[lang.key] || detail.desc[lang.key] || detail.rel[lang.key])
}

// Links inside descriptions point to other entries: search for that entry and open it.
function onDetailClick(event) {
    const link = event.target.closest('a[href^="#ws-"]')
    if (!link) return
    event.preventDefault()
    const id = link.getAttribute('href').slice('#ws-'.length)
    const entry = entries.value.find(e => e.id === id)
    if (!entry) return
    search.value = entry.ja
    openId.value = id
    fetchDetail(id)
    nextTick(() => document.getElementById(`ws-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

</script>

<template>
    <div class="row">
        <div class="card shadow-lg rounded min-vh-100">
            <div class="card-body mt-2">
                <input v-model="search" placeholder="Search (日本語 / English / ລາວ / ไทย)" class="my-4 form-control">
                <div class="" v-for="(data, index) in filteredList" :key="index">
                    <div class="border-bottom text-dark">
                        <span class="">{{ index }}. </span> {{ data }}
                    </div>
                </div>

                <h5 class="mt-4 text-black-50 fw-bolder fst-italic">
                    Water Supply Dictionary
                    <small v-if="entries.length" class="fw-normal fst-normal">
                        ({{ filteredEntries.length }} / {{ entries.length }})
                    </small>
                </h5>
                <p v-if="loadError" class="text-danger">Could not load the dictionary.</p>
                <p v-else-if="!entries.length" class="text-muted">Loading...</p>

                <div v-for="entry in visibleEntries" :key="entry.id" :id="'ws-' + entry.id" class="border-bottom text-dark">
                    <div class="ws-head py-1" role="button" :aria-expanded="openId === entry.id" @click="toggle(entry.id)">
                        <span class="fw-bold">{{ entry.ja }}</span>
                        <span v-if="entry.kana" class="text-muted">（{{ entry.kana }}）</span>
                        <span class="ms-2">{{ entry.en }}</span>
                        <span class="ms-2">{{ entry.lo }}</span>
                    </div>
                    <div v-if="openId === entry.id" class="ws-detail ps-3 pb-3" @click="onDetailClick">
                        <p v-if="!details[entry.id]" class="text-muted">Loading...</p>
                        <p v-else-if="details[entry.id] === 'error'" class="text-danger">Could not load this entry.</p>
                        <template v-else>
                            <section v-for="lang in sections(entry)" :key="lang.key" class="mt-3">
                                <div class="small text-black-50 fw-bold">{{ lang.label }}</div>
                                <div class="fw-bold">
                                    {{ entry[lang.key] }}
                                    <span v-if="lang.key === 'ja' && entry.kana" class="fw-normal text-muted">（{{ entry.kana }}）</span>
                                </div>
                                <div class="text-muted">{{ entry.en }}</div>
                                <div v-if="details[entry.id].desc[lang.key]" class="mt-1" v-html="details[entry.id].desc[lang.key]"></div>
                                <div v-if="details[entry.id].rel[lang.key]" class="mt-1">
                                    <span class="text-black-50">{{ lang.related }}：</span>
                                    <span v-html="details[entry.id].rel[lang.key]"></span>
                                </div>
                            </section>
                        </template>
                    </div>
                </div>

                <button v-if="visibleEntries.length < filteredEntries.length" type="button"
                    class="btn btn-outline-secondary my-3" @click="limit += PAGE_SIZE">
                    Show more ({{ filteredEntries.length - visibleEntries.length }})
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.ws-head {
    cursor: pointer;
}

.ws-detail :deep(img) {
    max-width: 100%;
    height: auto;
}

.ws-detail :deep(.ws-center) {
    text-align: center;
}

.ws-detail :deep(.ws-line) {
    width: 200px;
    margin: 2px auto;
    opacity: 1;
}
</style>
