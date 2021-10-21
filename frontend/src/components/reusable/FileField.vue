<template>
    <label
        :for="id"
        class="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        :class="{'opacity-50 cursor-not-allowed': $attrs.disabled}"
    >
        <slot></slot>
    </label>
    <input
        :id="id"
        @change="fileChanged"
        class="invisible w-0 h-0"
        type="file"
        :key="fileInputKey"
        v-bind="$attrs"
    >
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
    name: "FileField",
    emits: ['change'],
    props: {
        id: String,
    },
    data: () => ({
        fileInputKey: 0
    }),
    methods: {
        fileChanged(event: Event) {
            const target= event.target as HTMLInputElement;
            const file: File = (target.files as FileList)[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                let base64data = reader.result;
                if (!base64data) {
                    return
                }
                if (typeof base64data !== 'string') {
                    const enc = new TextDecoder("utf-8");
                    base64data = enc.decode(base64data);
                }
                // Get rid of data uri, such as data:image/png;base64,
                base64data = base64data.replace(/data:.+?,/, "");
                this.$emit('change', {
                    name: file.name,
                    content: base64data
                })
                this.fileInputKey++;
            }
            reader.readAsDataURL(file);
        }
    }
})
</script>