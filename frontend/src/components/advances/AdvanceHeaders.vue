<template>
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

    <modal-field
        id="purpose_uuid"
        v-model="headers.purpose_uuid"
        :errors="v$.headers.purpose_uuid.$errors"
        title="Выберите назначение"
        :items="possiblePurposes"
        :disabled="disabled"
    >Назначение
    </modal-field>

    <modal-field
        id="basis_uuid"
        v-model="headers.basis_uuid"
        :errors="v$.headers.basis_uuid.$errors"
        title="Выберите документ основание"
        :items="possibleBasisDocs"
        v-if="requireBasis"
        :disabled="disabled"
    >Документ основание
    </modal-field>
</template>

<script lang="ts">
import InputField from "@/components/reusable/InputField.vue";
import {computed, defineComponent, onMounted, PropType, ref, watch} from "vue";
import {helpers, required, requiredIf} from "@vuelidate/validators";
import {useVuelidate} from "@vuelidate/core";
import {useStore} from "vuex";
import ModalField from "@/components/reusable/ModalField.vue";
import backendService from "@/services/backend";
import {AdvanceHeaders, Expenditure, Option} from "@/types";

export default defineComponent({
    name: "AdvanceHeaders",
    components: {
        InputField,
        ModalField,
    },
    emits: ['update:modelValue'],
    props: {
        modelValue: {
            type: Object as PropType<AdvanceHeaders>,
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, {emit}) {
        const headers = ref<AdvanceHeaders>({} as AdvanceHeaders)

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

        let possiblePurposes = ref<Expenditure[]>([])
        onMounted(async () => {
            possiblePurposes.value = await backendService.advancePurposeList()
        })
        let possibleBasisDocs = ref<Option[]>([])
        onMounted(async () => {
            possibleBasisDocs.value = await backendService.tripBasisList()
        })

        const requireBasis = computed(() => {
            const purpose = possiblePurposes.value.find(purpose => purpose.uuid === headers.value.purpose_uuid)
            if (!purpose) {
                return false
            }
            return purpose.require_basis
        })

        const rules = computed(() => ({
            headers: {
                purpose_uuid: {required: helpers.withMessage('Введите Назначение', required)},
                basis_uuid: {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    required: helpers.withMessage('Введите Документ основание', requiredIf((value, vm) => {
                        return vm.requireBasis
                    }))
                },
            },
        }))
        const v$ = useVuelidate(rules, {headers})

        return {
            headers,
            organization_name,
            employee_name,
            possiblePurposes,
            possibleBasisDocs,
            requireBasis,
            v$,
        }
    },
})
</script>