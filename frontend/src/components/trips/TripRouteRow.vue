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
                v-model="item.date"
                type="date"
                :errors="v$.item.date.$errors"
                aria-label="Дата"
                :disabled="disabled"
            ></input-field>
        </td>
        <td class="border border-black p-1 break-all">
            <select-field
                v-model="item.type"
                :errors="v$.item.type.$errors"
                :options="typeOptions"
                aria-label="Вид транспорта"
                :disabled="disabled"
            ></select-field>
        </td>
        <td class="border border-black p-1 break-all">
            <input-field
                v-model="item.from"
                :errors="v$.item.from.$errors"
                aria-label="Откуда (город)"
                :disabled="disabled"
            ></input-field>
        </td>
        <td class="border border-black p-1 break-all">
            <input-field
                v-model="item.to"
                :errors="v$.item.to.$errors"
                aria-label="Куда (город)"
                :disabled="disabled"
            ></input-field>
        </td>
    </tr>
</template>

<script lang="ts">
import ButtonField from "@/components/reusable/ButtonField.vue";
import InputField from "@/components/reusable/InputField.vue";
import {computed, defineComponent, PropType} from "vue";
import {useVuelidate} from "@vuelidate/core";
import {helpers, required} from "@vuelidate/validators";
import {useGenericItemRow} from "@/composition/ItemRow";
import {TripRoute} from "@/types";
import SelectField from "@/components/reusable/SelectField.vue";

export default defineComponent({
    name: "TripRouteRow",
    components: {
        ButtonField,
        SelectField,
        InputField,
    },
    props: {
        modelValue: {
            type: Object as PropType<TripRoute>,
            required: true,
        },
        disabled: {
            type: Boolean,
            required: true,
        },
    },
    emits: ['update:modelValue', 'delete-row'],
    setup(props, context) {
        const {item, deleteRow} = useGenericItemRow<TripRoute>(props, context)

        const typeOptions = [
            {
                uuid: 'Авиа',
                name: 'Авиа',
            },
            {
                uuid: 'ЖД',
                name: 'ЖД',
            },
        ]

        const rules = computed(() => ({
            item: {
                date: {required: helpers.withMessage('Введите дату', required)},
                type: {required: helpers.withMessage('Введите вид транспорта', required)},
                from: {required: helpers.withMessage('Введите откуда (город)', required)},
                to: {required: helpers.withMessage('Введите куда (город)', required)},
            },
        }))
        const v$ = useVuelidate(rules, {item})

        return {
            item,
            typeOptions,
            deleteRow,
            v$,
        }
    }
})
</script>