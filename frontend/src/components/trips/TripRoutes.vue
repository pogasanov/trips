<template>
    <div class="flex my-3 items-end">
        <button-field
            @click="addItem"
            :disabled="disabled"
        >Добавить строку
        </button-field>
    </div>

    <table class="table-fixed border-separate">
        <thead>
        <tr>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10"></th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Дата</th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Вид транспорта</th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Откуда (город)</th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Куда (город)</th>
        </tr>
        </thead>
        <tbody>
        <trip-route-row
            v-for="(_, i) in items"
            :key="i"
            v-model="items[i]"
            @delete-row="deleteItem(i)"
            :disabled="disabled"
        >
        </trip-route-row>
        </tbody>
    </table>
</template>

<script lang="ts">
import ButtonField from "@/components/reusable/ButtonField.vue";
import {defineComponent, onMounted, PropType, ref, watch} from "vue";
import TripRouteRow from "@/components/trips/TripRouteRow.vue";
import {TripRoute} from "@/types";

export default defineComponent({
    name: "TripRoutes",
    components: {
        ButtonField,
        TripRouteRow,
    },
    props: {
        modelValue: {
            type: Array as PropType<TripRoute[]>,
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:modelValue'],
    setup(props, {emit}) {
        const items = ref<TripRoute[]>([]);

        onMounted(() => {
            items.value = props.modelValue
        })

        watch(items, (newValue) => {
            emit('update:modelValue', newValue)
        })
        watch(() => props.modelValue, (newValue) => {
            items.value = newValue
        })

        const addItem = () => {
            items.value.push({
                date: '',
                type: '',
                from: '',
                to: '',
            })
        }
        const deleteItem = (index: number) => {
            items.value.splice(index, 1)
        }

        return {
            items,
            addItem,
            deleteItem,
        }
    },
})
</script>