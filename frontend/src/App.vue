<template>
    <div :class="{'flex items-center justify-center h-screen': $route.meta.isFullHeight}"
         id="app">

        <div :class="{'flex items-center justify-center h-screen': !$route.meta.isFullHeight}"
             v-show="$store.state.bootstrap.is_loading">
            Пожалуйста, подождите...
        </div>

        <router-view v-show="!$store.state.bootstrap.is_loading"/>
        <modals-container></modals-container>

    </div>
</template>

<script lang="ts">

import {defineComponent} from "vue";
import {ModalsContainer} from "vue-final-modal";

export default defineComponent({
    name: "App",
    components: {
        ModalsContainer,
    }
})
</script>