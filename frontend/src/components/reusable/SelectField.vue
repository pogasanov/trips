<template>
    <label :for="id" v-if="$slots.default" class="block text-gray-700 text-sm font-bold mb-2 mt-4">
        <slot></slot>
    </label>
    <select
        :id="id"
        :value="modelValue"
        v-bind="$attrs"
        @input="optionChosen"
        class="shadow appearance-none border rounded w-full p-1 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        :class="{'bg-gray-100 cursor-not-allowed': $attrs.disabled}"
    >
        <option selected value="">Выберите значение из списка</option>
        <option :key="option.uuid" :value="option.uuid" v-for="option in options">
            {{ option.name }}
        </option>
    </select>
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
import {Option} from "@/types";

export default defineComponent({
    name: "SelectField",
    emits: ['update:modelValue'],
    props: {
        modelValue: String,
        id: String,
        options: {
            type: Array as PropType<Option[]>,
            required: true,
        },
        errors: {
            type: Array as PropType<ErrorObject[]>,
            required: false
        },
    },
    methods: {
        optionChosen(event: Event) {
            const { target } = event
            if (target) {
                this.$emit('update:modelValue', (target as HTMLSelectElement).value)
            }
        }
    }
})
</script>