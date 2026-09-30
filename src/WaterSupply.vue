<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue';
import WaterSupplyList from './data/WaterSupplyList.json'
import { loadDetail, loadIndex } from './waterSupplyDictionary.js'
import { normalize } from './search.js'
import WordItem from './components/WordItem.vue'

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
    <div>
        <div class="search-bar pt-3 pb-2">
            <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input v-model="search" type="search" class="form-control" placeholder="検索 · ຄົ້ນຫາ · Search">
            </div>
            <div v-if="entries.length" class="small text-body-secondary mt-1">
                {{ filteredEntries.length + filteredList.length }} / {{ entries.length + datas.length }}
            </div>
        </div>

        <template v-if="filteredList.length">
            <h2 class="h6 fw-bold text-body-secondary mt-2 mb-1"><i class="bi bi-bookmark me-1"></i>My words</h2>
            <ul class="list-group list-group-flush mb-3">
                <WordItem v-for="(data, index) in filteredList" :key="index" :text="data" />
            </ul>
        </template>

        <h2 class="h6 fw-bold text-body-secondary mt-2 mb-1"><i class="bi bi-book me-1"></i>Water Supply Dictionary (MawaSU2)</h2>
        <p v-if="loadError" class="text-danger my-3"><i class="bi bi-exclamation-triangle me-1"></i>Could not load the dictionary.</p>
        <p v-else-if="!entries.length" class="text-body-secondary my-3">
            <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Loading...
        </p>
        <p v-else-if="!filteredEntries.length" class="text-body-secondary text-center py-4 mb-0">
            <i class="bi bi-emoji-neutral"></i> No results
        </p>

        <div class="list-group list-group-flush">
            <div v-for="entry in visibleEntries" :key="entry.id" :id="'ws-' + entry.id" class="list-group-item p-0">
                <button type="button" class="ws-head btn w-100 text-start d-flex align-items-start gap-2 px-3 py-2 border-0 rounded-0"
                    :aria-expanded="openId === entry.id" @click="toggle(entry.id)">
                    <span class="flex-grow-1">
                        <span class="d-block word-jp">
                            {{ entry.ja }} <span v-if="entry.kana" class="word-reading">（{{ entry.kana }}）</span>
                        </span>
                        <span class="d-block word-meaning">{{ entry.lo }}</span>
                        <span class="d-block small text-body-secondary">{{ entry.en }}</span>
                    </span>
                    <i class="bi bi-chevron-down ws-chevron mt-1" :class="{ open: openId === entry.id }"></i>
                </button>

                <div v-if="openId === entry.id" class="ws-detail px-3 pb-3" @click="onDetailClick">
                    <p v-if="!details[entry.id]" class="text-body-secondary mb-0">
                        <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Loading...
                    </p>
                    <p v-else-if="details[entry.id] === 'error'" class="text-danger mb-0">Could not load this entry.</p>
                    <template v-else>
                        <section v-for="lang in sections(entry)" :key="lang.key" class="ws-section rounded-3 p-3 mt-2">
                            <span class="badge text-bg-primary mb-2">{{ lang.label }}</span>
                            <div class="fw-bold">
                                {{ entry[lang.key] }}
                                <span v-if="lang.key === 'ja' && entry.kana" class="word-reading">（{{ entry.kana }}）</span>
                            </div>
                            <div class="small text-body-secondary mb-2">{{ entry.en }}</div>
                            <div v-if="details[entry.id].desc[lang.key]" v-html="details[entry.id].desc[lang.key]"></div>
                            <div v-if="details[entry.id].rel[lang.key]" class="mt-2 small">
                                <i class="bi bi-link-45deg"></i>
                                <span class="text-body-secondary">{{ lang.related }}：</span>
                                <span v-html="details[entry.id].rel[lang.key]"></span>
                            </div>
                        </section>
                    </template>
                </div>
            </div>
        </div>

        <div v-if="visibleEntries.length < filteredEntries.length" class="text-center">
            <button type="button" class="btn btn-outline-secondary my-3" @click="limit += PAGE_SIZE">
                Show more ({{ filteredEntries.length - visibleEntries.length }})
            </button>
        </div>
    </div>
</template>

<style scoped>
.ws-head:hover,
.ws-head[aria-expanded="true"] {
    background: var(--bs-tertiary-bg);
}

/* keep an entry opened from a cross-reference link below the sticky search box */
.list-group-item[id^="ws-"] {
    scroll-margin-top: 7rem;
}

.ws-chevron {
    transition: transform 0.2s;
}

.ws-chevron.open {
    transform: rotate(180deg);
}

.ws-section {
    background: var(--bs-tertiary-bg);
}

/* Formula and figure images are black on transparent; keep them readable in dark mode */
.ws-detail :deep(img) {
    max-width: 100%;
    height: auto;
    background: #fff;
    border-radius: 4px;
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
