<script setup>

import Home from './Home.vue'
import General from './General.vue'
import WaterSupply from './WaterSupply.vue'

</script>

<template>
    <div class="min-vh-100 min-vw-100 " style="font-family: Noto Sans Lao;">
        <div class="container">
            <div class="row">
                <nav class="navbar navbar-expand-lg navbar-expand-md navbar-light bg-light">
                    <div class="nav nav-tabs fw-bold" id="nav-tab" role="tablist">
                        <button class="nav-link active fw-bold" id="nav-home-tab" data-bs-toggle="tab"
                            data-bs-target="#nav-home" type="button" role="tab" aria-controls="nav-home"
                            aria-selected="true">Home</button>
                        <button class="nav-link fw-bold" id="nav-general-tab" data-bs-toggle="tab"
                            data-bs-target="#nav-general" type="button" role="tab" aria-controls="nav-general"
                            aria-selected="false">General</button>
                        <button class="nav-link fw-bold" id="nav-waterSupply-tab" data-bs-toggle="tab"
                            data-bs-target="#nav-waterSupply" type="button" role="tab" aria-controls="nav-waterSupply"
                            aria-selected="false">Water Supply</button>
                    </div>
                </nav>
                <div class="tab-content" id="nav-tabContent">
                    <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
                        <Home />
                    </div>
                    <div class="tab-pane fade" id="nav-general" role="tabpanel" aria-labelledby="nav-general-tab">
                        <General />
                    </div>
                    <div class="tab-pane fade" id="nav-waterSupply" role="tabpanel" aria-labelledby="nav-waterSupply-tab">
                        <WaterSupply />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
