<script setup>

import Home from './Home.vue'
import General from './General.vue'
import WaterSupply from './WaterSupply.vue'
import HealthCare from './HealthCare.vue'


</script>

<template>
    <div class="min-vh-100" style="font-family: Noto Sans Lao;">
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
                        <button class="nav-link fw-bold" id="nav-healthCare-tab" data-bs-toggle="tab"
                            data-bs-target="#nav-healthCare" type="button" role="tab" aria-controls="nav-healthCare"
                            aria-selected="false">Health Care</button> 
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
                    <div class="tab-pane fade" id="nav-healthCare" role="tabpanel" aria-labelledby="nav-healthCare-tab">
                        <HealthCare />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
