<template>
    <div class="flex my-3 items-end">
        <button-field
            @click="addItem"
            :disabled="disabled"
            class="p-2 mr-3"
        >Добавить строку
        </button-field>
        <modal-button
            :disabled="disabled"
            component="DateRangeModal"
            title="Выберите поездку"
            :fetch-items="getTripsWithBasis"
            @itemSelected="fillUsingBasis"
            data-testid="fill-modal"
        >Заполнить по данным поездки
        </modal-button>
    </div>

    <table class="table-fixed border-separate">
        <thead>
        <tr>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10"></th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Вид входящего документа</th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Номер входящего документа</th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Дата входящего документа</th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Номер СФ</th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Дата СФ</th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Поставщик</th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Содержание</th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Количество</th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Цена</th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Сумма</th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Ставка НДС</th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Сумма НДС</th>
            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Всего</th>
        </tr>
        </thead>
        <tbody>
        <advance-items-row
            v-for="(_, i) in items"
            :key="i"
            v-model="items[i]"
            @delete-row="deleteItem(i)"
            :disabled="disabled"
        >
        </advance-items-row>
        </tbody>
    </table>
</template>

<script lang="ts">
import ButtonField from "@/components/reusable/ButtonField.vue";
import {defineComponent, onMounted, PropType, ref, watch} from "vue";
import AdvanceItemsRow from "@/components/advances/AdvanceItemsRow.vue";
import {AdvanceItem} from "@/types";
import ModalButton from "@/components/reusable/ModalButton.vue";
import backendService from "@/services/backend";

export default defineComponent({
    name: "AdvanceItems",
    components: {
        ButtonField,
        AdvanceItemsRow,
        ModalButton,
    },
    props: {
        modelValue: {
            type: Array as PropType<AdvanceItem[]>,
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:modelValue'],
    setup(props, {emit}) {
        const items = ref<AdvanceItem[]>([]);

        onMounted(() => {
            items.value = props.modelValue
        })

        watch(items, (newValue) => {
            emit('update:modelValue', newValue)
        })
        watch(() => props.modelValue, (newValue) => {
            items.value = newValue
        })

        const getTripsWithBasis = (filters: {filterFrom: string, filterTo: string}) => backendService.advanceFillUsingBasis(filters)
        const fillUsingBasis = (newItems: AdvanceItem[]) => {
            items.value = items.value.concat(newItems)
        }

        const addItem = () => {
            items.value.push({
                incoming_doc_type: '',
                incoming_doc_number: '',
                incoming_doc_date: '',
                invoice_number: '',
                invoice_date: '',
                partner_uuid: '',
                content: '',
                quantity: 0,
                price: 0,
                total: 0,
                vat_rate: '',
                vat_total: 0,
            })
        }
        const deleteItem = (index: number) => {
            items.value.splice(index, 1)
        }

        return {
            items,
            addItem,
            deleteItem,
            getTripsWithBasis,
            fillUsingBasis,
        }
    },
})
</script>