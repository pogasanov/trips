<template>
    <div class="flex gap-4">
        <div class="flex-1">
            <select-field
                id="type"
                v-model="headers.type"
                :options="$store.state.bootstrap.trip_type_options"
                :errors="v$.headers.type.$errors"
                :disabled="disabled"
            >Вид документа
            </select-field>

            <modal-field
                id="basis_uuid"
                v-model="headers.basis_uuid"
                v-if="headers.type === 'Изменение условий командировки'"
                :errors="v$.headers.basis_uuid.$errors"
                :disabled="disabled"
                title="Выберите документ основание"
                :items="possibleBasisDocs"
                @update:modelValue="$emit('update_basis_uuid', $event)"
            >Документ основание
            </modal-field>

            <textarea-field
                id="basis_update_reason"
                v-model="headers.basis_update_reason"
                v-if="headers.type === 'Изменение условий командировки'"
                :errors="v$.headers.basis_update_reason.$errors"
                :disabled="disabled"
                title="Выберите документ основание">
                Причина изменений условий командировки
            </textarea-field>

            <input-field
                id="organization"
                v-model="organization_name"
                disabled="disabled"
            >Организация
            </input-field>

            <input-field
                id="employee"
                v-model="employee_name"
                disabled="disabled"
            >Сотрудник
            </input-field>

            <input-field
                id="destination_organization"
                v-model="headers.destination_organization"
                :errors="v$.headers.destination_organization.$errors"
                :disabled="disabled"
            >Место назначения (организация)
            </input-field>

            <input-field
                id="destination_city"
                v-model="headers.destination_city"
                :errors="v$.headers.destination_city.$errors"
                :disabled="disabled"
            >Место назначения (страна, город)
            </input-field>

            <input-field
                id="errand"
                v-model="headers.errand"
                :errors="v$.headers.errand.$errors"
                :disabled="disabled"
            >Служебное поручение (цель)
            </input-field>
        </div>

        <div class="flex-1">
            <input-field
                id="date_start"
                v-model="headers.date_start"
                :errors="v$.headers.date_start.$errors"
                type="date"
                :disabled="disabled"
            >Дата начала командировки
            </input-field>

            <input-field
                id="date_end"
                v-model="headers.date_end"
                :errors="v$.headers.date_end.$errors"
                type="date"
                :disabled="disabled"
            >Дата окончания командировки
            </input-field>

            <input-field
                id="price_tickets"
                v-model="headers.price_tickets"
                type="number"
                :disabled="disabled"
            >Стоимость билетов в обе стороны (если билеты покупаются не через SmartWay)
            </input-field>

            <input-field
                id="price_living"
                v-model="headers.price_living"
                type="number"
                :disabled="disabled"
            >Стоимость проживания
            </input-field>

            <select-field
                id="per_diem_rate"
                v-model="headers.per_diem_rate_uuid"
                :options="$store.getters['bootstrap/perDiemRateAsOptions']"
                :errors="v$.headers.per_diem_rate_uuid.$errors"
                :disabled="disabled"
            >Вид суточной ставки
            </select-field>

            <span v-if="calculatePerDiemTotal">
                Итоговая стоимость: {{ calculatePerDiemTotal }}
            </span>

            <input-field
                id="smartway_codes_count"
                v-model="headers.smartway_codes_count"
                type="number"
                :disabled="disabled"
            >Количество кодов для покупки билетов в SmartWay
            </input-field>
        </div>
    </div>
</template>

<script lang="ts">
import InputField from "@/components/reusable/InputField.vue";
import {computed, defineComponent, onMounted, PropType, ref, watch} from "vue";
import SelectField from "@/components/reusable/SelectField.vue";
import {helpers, required, requiredIf} from "@vuelidate/validators";
import {useVuelidate} from "@vuelidate/core";
import {useStore} from "vuex";
import ModalField from "@/components/reusable/ModalField.vue";
import backendService from "@/services/backend";
import {Option, TripHeaders, PerDiemRate} from "@/types";
import TextareaField from "@/components/reusable/TextareaField.vue";

export default defineComponent({
    name: "TripHeaders",
    components: {
        InputField,
        SelectField,
        ModalField,
        TextareaField,
    },
    emits: ['update:modelValue', 'update_basis_uuid'],
    props: {
        modelValue: {
            type: Object as PropType<TripHeaders>,
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, {emit}) {
        const headers = ref<TripHeaders>({} as TripHeaders)
        onMounted(() => {
            headers.value = props.modelValue
        })
        watch(headers, (newValue) => {
            emit('update:modelValue', newValue)
        })

        const store = useStore()
        const organization_name = computed(() => {
            return (store.getters['bootstrap/getOrganizationByUuid'](headers.value.organization_uuid) || {}).name
        })
        const employee_name = computed(() => {
            return (store.getters['bootstrap/getUserByUuid'](headers.value.employee_uuid) || {}).name
        })

        let possibleBasisDocs = ref<Option[]>([])
        onMounted(async () => {
            possibleBasisDocs.value = await backendService.tripBasisList()
        })

        const calculatePerDiemTotal = computed(() => {
            if (!headers.value.date_start || !headers.value.date_end || !headers.value.per_diem_rate_uuid) {
                return ''
            }
            const date1 = new Date(headers.value.date_start);
            const date2 = new Date(headers.value.date_end);

            const Difference_In_Time = date2.getTime() - date1.getTime();
            const days = Difference_In_Time / (1000 * 3600 * 24) + 1

            return days * store.state.bootstrap.per_diem_rates.find((per_diem_rate: PerDiemRate) => per_diem_rate.uuid === headers.value.per_diem_rate_uuid).rate
        })

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const requireIfTypeIsUpdate = requiredIf((value, vm) => {
            return vm.headers.type === 'Изменение условий командировки'
        })

        const rules = computed(() => ({
            headers: {
                type: {required: helpers.withMessage('Введите Вид документа', required)},
                basis_uuid: {required: helpers.withMessage('Введите Документ основание', requireIfTypeIsUpdate)},
                basis_update_reason: {required: helpers.withMessage('Введите Причина изменений условий командировки', requireIfTypeIsUpdate)},
                destination_organization: {required: helpers.withMessage('Введите Место назначения (организация)', required)},
                destination_city: {required: helpers.withMessage('Введите Место назначения (страна, город)', required)},
                errand: {required: helpers.withMessage('Введите Служебное поручение (цель)', required)},
                date_start: {required: helpers.withMessage('Введите Дата начала командировки', required)},
                date_end: {required: helpers.withMessage('Введите Дата окончания командировки', required)},
                per_diem_rate_uuid: {required: helpers.withMessage('Выберите Вид суточной ставки', required)},
            },
        }))
        const v$ = useVuelidate(rules, {headers})

        return {
            headers,
            organization_name,
            employee_name,
            possibleBasisDocs,
            calculatePerDiemTotal,
            v$,
        }
    },
})
</script>