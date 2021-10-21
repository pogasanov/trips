<template>
    <label :id="id" v-if="$slots.default" class="block text-gray-700 text-sm font-bold mb-2 mt-4">
        <slot></slot>
    </label>
    <button @click="openModal" :aria-labelledby="id" v-bind="$attrs" class="disabled:py-1 disabled:px-2 disabled:bg-gray-100 disabled:cursor-not-allowed">{{ modelName }}</button>
    <p
        v-for="error in errors"
        :key="error.$uid"
        class="text-red-500"
    >
        <strong>{{ error.$message }}</strong>
    </p>
</template>

<script lang="ts">
import {defineComponent, computed, PropType} from 'vue'
import {Option} from "@/types";
import {$vfm} from 'vue-final-modal';
import {ErrorObject} from "@vuelidate/core";

export default defineComponent({
    name: "ModalField",
    emits: ['update:modelValue'],
    props: {
        modelValue: String,
        id: String,
        errors: {
            type: Array as PropType<ErrorObject[]>,
            required: false
        },
        component: {
            type: String,
            default: 'DefaultModal'
        },
        title: {
            type: String,
            default: '',
        },
        items: [Array, Function],
    },
    setup(props, {emit}) {
        const openModal = () => {
            $vfm.show({
                component: props.component,
                bind: {
                    items: props.items
                },
                on: {
                    itemSelected(item: string, close: () => void) {
                        emit('update:modelValue', item)
                        close()
                    },
                },
                slots: {
                    title: props.title,
                }
            })
        }

        const modelName = computed(() => {
            if (typeof props.items === 'function') {
                return "Нажмите чтобы выбрать"
            }
            return ((props.items as Option[]).find(item => item.uuid === props.modelValue) || {name: 'Нажмите чтобы выбрать'}).name
        })

        return {
            openModal,
            modelName
        }
    },
})
</script>