<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import Home from './Home.vue'
import General from './General.vue'
import WaterSupply from './WaterSupply.vue'
import HealthCare from './HealthCare.vue'

const TABS = [
    { id: 'home', label: 'All Words', icon: 'bi-collection', component: Home },
    { id: 'general', label: 'General', icon: 'bi-chat-square-text', component: General },
    { id: 'waterSupply', label: 'Water Supply', icon: 'bi-droplet', component: WaterSupply },
    { id: 'healthCare', label: 'Health Care', icon: 'bi-heart-pulse', component: HealthCare },
]

// The open tab is kept in the URL (#waterSupply) so a reload or shared link opens the same tab.
const tabFromHash = () => TABS.find(tab => `#${tab.id}` === location.hash)?.id ?? 'home'
const activeTab = ref(tabFromHash())

// On narrow screens the tab row scrolls sideways; keep the selected tab in view.
const revealActiveTab = () => nextTick(() =>
    document.getElementById(`nav-${activeTab.value}-tab`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' }))

watch(activeTab, (id) => {
    history.replaceState(null, '', id === 'home' ? location.pathname : `#${id}`)
    revealActiveTab()
})
onMounted(revealActiveTab)

const theme = ref(document.documentElement.getAttribute('data-bs-theme') || 'light')
function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-bs-theme', theme.value)
    try { localStorage.setItem('theme', theme.value) } catch (e) { /* storage unavailable */ }
}
</script>

<template>
    <header class="bg-primary text-white">
        <div class="container d-flex align-items-center py-3">
            <i class="bi bi-translate fs-3 me-3"></i>
            <div class="flex-grow-1">
                <h1 class="h5 mb-0 fw-bold">Japanese–Lao Word List</h1>
                <div class="small opacity-75">日本語 ⇄ ພາສາລາວ 単語帳</div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-light" @click="toggleTheme"
                :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
                <i class="bi" :class="theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'"></i>
            </button>
        </div>
    </header>

    <main class="container py-3">
        <nav class="nav nav-pills app-tabs gap-1 mb-3" role="tablist">
            <button v-for="tab in TABS" :key="tab.id" :id="`nav-${tab.id}-tab`" type="button" role="tab"
                class="nav-link" :class="{ active: activeTab === tab.id }"
                :aria-selected="activeTab === tab.id" :aria-controls="`nav-${tab.id}`"
                @click="activeTab = tab.id">
                <i class="bi me-1" :class="tab.icon"></i>{{ tab.label }}
            </button>
        </nav>

        <div class="card shadow-sm border-0">
            <div class="card-body pt-0">
                <!-- v-show keeps every tab mounted, so each search box keeps its text -->
                <div v-for="tab in TABS" v-show="activeTab === tab.id" :key="tab.id" :id="`nav-${tab.id}`" role="tabpanel"
                    :aria-labelledby="`nav-${tab.id}-tab`">
                    <component :is="tab.component" />
                </div>
            </div>
        </div>
    </main>
</template>
