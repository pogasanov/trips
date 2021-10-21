<template>
    <tr>
        <td class="border border-black p-1 break-all">
            <button-field
                @click="deleteRow"
                :disabled="disabled"
            >-
            </button-field>
        </td>
        <td class="border border-black p-1 break-all">
            <input-field
                v-model="item.incoming_doc_type"
                aria-label="Вид входящего документа"
                :disabled="disabled"
            ></input-field>
        </td>
        <td class="border border-black p-1 break-all">
            <input-field
                v-model="item.incoming_doc_number"
                aria-label="Номер входящего документа"
                :disabled="disabled"
            ></input-field>
        </td>
        <td class="border border-black p-1 break-all">
            <input-field
                v-model="item.incoming_doc_date"
                type="date"
                aria-label="Дата входящего документа"
                :disabled="disabled"
            ></input-field>
        </td>
        <td class="border border-black p-1 break-all">
            <input-field
                v-model="item.invoice_number"
                aria-label="Номер СФ"
                :disabled="disabled"
            ></input-field>
        </td>
        <td class="border border-black p-1 break-all">
            <input-field
                v-model="item.invoice_date"
                type="date"
                aria-label="Дата СФ"
                :disabled="disabled"
            ></input-field>
        </td>
        <td class="border border-black p-1 break-all">
            <modal-field
                id="partner_uuid"
                v-model="item.partner_uuid"
                title="Выберите поставщика"
                :items="$store.state.bootstrap.partners"
                :disabled="disabled"
                aria-label="Поставщик"
            ></modal-field>
        </td>
        <td class="border border-black p-1 break-all">
            <input-field
                v-model="item.content"
                aria-label="Содержание"
                :disabled="disabled"
            ></input-field>
        </td>
        <td class="border border-black p-1 break-all">
            <input-field
                v-model="item.quantity"
                type="number"
                aria-label="Количество"
                :disabled="disabled"
            ></input-field>
        </td>
        <td class="border border-black p-1 break-all">
            <input-field
                v-model="item.price"
                :errors="v$.item.price.$errors"
                type="number"
                aria-label="Цена"
                :disabled="disabled"
            ></input-field>
        </td>
        <td class="border border-black p-1 break-all">
            <input-field
                v-model="item.total"
                :errors="v$.item.total.$errors"
                type="number"
                aria-label="Сумма"
                :disabled="disabled"
            ></input-field>
        </td>
        <td class="border border-black p-1 break-all">
            <select-field
                v-model="item.vat_rate"
                :options="vat_rate_options"
                :errors="v$.item.vat_rate.$errors"
                aria-label="Ставка НДС"
                :disabled="disabled">
            </select-field>
        </td>
        <td class="border border-black p-1 break-all">
            <input-field
                v-model="item.vat_total"
                type="number"
                aria-label="Сумма НДС"
                :disabled="disabled"
            ></input-field>
        </td>
        <td class="border border-black p-1 break-all">
            {{ full_total }}
        </td>
    </tr>
</template>

<script lang="ts">
import ButtonField from "@/components/reusable/ButtonField.vue";
import InputField from "@/components/reusable/InputField.vue";
import {computed, defineComponent, PropType} from "vue";
import {useVuelidate} from "@vuelidate/core";
import {helpers, minValue, required} from "@vuelidate/validators";
import {useGenericItemRow} from "@/composition/ItemRow";
import {AdvanceItem} from "@/types";
import SelectField from "@/components/reusable/SelectField.vue";
import ModalField from "@/components/reusable/ModalField.vue";
import {formatStringAsFinancialString} from "@/composition/math";

export default defineComponent({
    name: "AdvanceItemsRow",
    components: {
        ButtonField,
        InputField,
        SelectField,
        ModalField,
    },
    props: {
        modelValue: {
            type: Object as PropType<AdvanceItem>,
            required: true,
        },
        disabled: {
            type: Boolean,
            required: true,
        },
    },
    emits: ['update:modelValue', 'delete-row'],
    setup(props, context) {
        const {item, deleteRow} = useGenericItemRow<AdvanceItem>(props, context)
        const vat_rate_options = [
            {
                uuid: 'Без НДС',
                name: 'Без НДС',
            },
            {
                uuid: '0%',
                name: '0%',
            },
            {
                uuid: '10%',
                name: '10%',
            },
            {
                uuid: '20%',
                name: '20%',
            },
        ]

        const rules = computed(() => ({
            item: {
                price: {
                    required: helpers.withMessage('Введите цену с НДС', required),
                    minValue: helpers.withMessage('Введите цену с НДС', minValue(0.001)),
                },
                total: {
                    required: helpers.withMessage('Введите сумму с НДС', required),
                    minValue: helpers.withMessage('Введите сумму с НДС', minValue(0.001)),
                },
                vat_rate: {
                    required: helpers.withMessage('Введите ставку НДС', required),
                },
            },
        }))
        const v$ = useVuelidate(rules, {item})

        const full_total = computed(() => (formatStringAsFinancialString((item.value.total + item.value.vat_total).toString())))

        return {
            vat_rate_options,
            full_total,
            item,
            deleteRow,
            v$,
        }
    }
})
</script>