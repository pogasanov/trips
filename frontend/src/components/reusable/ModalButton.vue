<template>
    <button-field @click="openModal"><slot></slot></button-field>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {$vfm} from "vue-final-modal";
import ButtonField from "@/components/reusable/ButtonField.vue";

export default defineComponent({
    name: "ModalButton",
    emits: ['itemSelected'],
    components: {
        ButtonField,
    },
    props: {
        component: {
            type: String,
            default: 'DefaultModal'
        },
        title: {
            type: String,
            default: '',
        },
        items: {
            type: Array,
            required: false,
        },
        fetchItems: {
            type: Function,
            required: false
        }
    },
    setup(props, {emit}) {
        const openModal = () => {
            $vfm.show({
                component: props.component,
                bind: {
                    items: props.items,
                    fetchItems: props.fetchItems
                },
                on: {
                    itemSelected(item: unknown, close: () => void) {
                        emit('itemSelected', item)
                        close()
                    },
                },
                slots: {
                    title: props.title,
                }
            })
        }

        return {
            openModal
        }
    },
})
</script>