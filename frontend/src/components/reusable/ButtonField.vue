<template>
    <button
        class="text-white font-bold rounded bg-blue-500 hover:bg-blue-700 disabled:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="computedClasses"
    >
        <slot></slot>
    </button>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
    name: "ButtonField",
    computed: {
        computedClasses(): string {
            if (this.$attrs.class) {
                return (this.$attrs.class as string)
            }
            return 'px-2 py-2'
        }
    }
})
</script>