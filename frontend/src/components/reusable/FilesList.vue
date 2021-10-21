<template>
    <div>
        <file-field
            id="file"
            @change="addFile"
            :disabled="disabled"
        >Добавить файл</file-field>
    </div>
    <table class="w-full">
        <thead class="text-sm leading-3 sticky top-0 bg-white border-b-2">
        <tr>
            <th>Наименование</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="(file, index) in files"
            :key="file.uuid"
        >
            <td>{{ file.name }}</td>
            <td>
                <ButtonField
                    @click="removeFile(index)"
                    :disabled="disabled"
                >X</ButtonField>
            </td>
        </tr>
        </tbody>
    </table>
</template>

<script lang="ts">
import ButtonField from "@/components/reusable/ButtonField.vue";
import FileField from "@/components/reusable/FileField.vue";
import {defineComponent, PropType} from "vue";
import {GenericFile} from "@/types";

export default defineComponent({
    name: "FilesList",
    components: {
        ButtonField,
        FileField,
    },
    emits: ['update:modelValue'],
    props: {
        modelValue: {
            type: Array as PropType<GenericFile[]>,
            required: true,
        },
        disabled: {
            type: Boolean,
            required: true,
        },
    },
    data: () => ({
       files: [] as GenericFile[]
    }),
    mounted() {
        this.files = this.modelValue
    },
    methods: {
        addFile(file: GenericFile) {
            this.files.push(file);
            this.$emit('update:modelValue', this.files)
        },
        removeFile(index: number) {
            this.files.splice(index, 1)
            this.$emit('update:modelValue', this.files)
        }
    },
    watch: {
        modelValue(newValue) {
            this.files = newValue
        }
    }
})
</script>