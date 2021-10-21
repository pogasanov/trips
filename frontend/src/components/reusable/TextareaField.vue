<template>
    <label :for="id" v-if="$slots.default" class="block text-gray-700 text-sm font-bold mb-2 mt-4">
        <slot></slot>
    </label>
    <textarea
        :id="id"
        :value="modelValue"
        v-bind="$attrs"
        @input="inputTyped"
        class="shadow appearance-none border rounded w-full p-1 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        :class="{'bg-gray-100 cursor-not-allowed': $attrs.disabled}"
    ></textarea>
    <p
        v-for="error in errors"
        :key="error.$uid"
        class="text-red-500"
    >
        <strong>{{ error.$message }}</strong>
    </p>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {ErrorObject} from "@vuelidate/core";

export default defineComponent({
    name: "TextareaField",
    emits: ['update:modelValue'],
    props: {
        modelValue: String,
        id: String,
        errors: {
            type: Array as PropType<ErrorObject[]>,
            required: false
        }
    },
    methods: {
        inputTyped(event: Event) {
            const {target} = event
            if (target) {
                this.$emit('update:modelValue', (target as HTMLTextAreaElement).value)
            }
        }
    }
})
</script>