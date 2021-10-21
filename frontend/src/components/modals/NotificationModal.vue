<template>
    <vue-final-modal
        v-bind="$attrs"
        classes="flex justify-center items-center"
        content-class="relative flex flex-col max-h-full mx-4 p-4 border dark:border-gray-800 rounded bg-white dark:bg-gray-900"
    >
    <span class="mr-8 text-2xl font-bold">
      {{ title }}
    </span>
        <div class="flex-grow overflow-y-auto">
            {{ content }}
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {VueFinalModal} from "vue-final-modal";

export default defineComponent({
    name: "NotificationModal",
    components: {
        VueFinalModal,
    },
    props: {
        title: String,
        content: String,
    }
})
</script>