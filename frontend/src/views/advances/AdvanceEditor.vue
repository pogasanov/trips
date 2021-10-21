<template>
    <div class="flex my-3">
        <div class="mr-3">
            <button-field
                :disabled="disabled"
                @click="saveDocument(false)"
            >Отправить на согласование
            </button-field>
        </div>
        <div class="mr-3"
             v-if="can_save_as_draft"
        >
            <button-field
                :disabled="disabled"
                @click="saveDocument(true)"
            >Сохранить черновик
            </button-field>
        </div>
        <div class="mr-3">
            <button-field
                @click="closeDocument()"
            >Закрыть без сохранения
            </button-field>
        </div>

    </div>

    <tabs v-bind="$attrs">
        <tab name="Основное" id="main" :has-error="headersErrors">
            <advance-headers
                v-model="headers"
                :disabled="disabled"
            ></advance-headers>
        </tab>
        <tab name="Авансовый отчёт" id="items" :has-error="itemsErrors">
            <advance-items
                v-model="items"
                :disabled="disabled"
            ></advance-items>
        </tab>
        <tab name="Файлы" id="files">
            <files-list
                v-model="files"
                :disabled="disabled"
            ></files-list>
        </tab>
    </tabs>
</template>

<script lang="ts">
import Tabs from "@/components/reusable/Tabs.vue";
import Tab from "@/components/reusable/Tab.vue";
import ButtonField from "@/components/reusable/ButtonField.vue";
import FilesList from "@/components/reusable/FilesList.vue";
import {useRouter} from "vue-router";
import {computed, defineComponent, onMounted, ref} from "vue";
import backendService from "@/services/backend";
import {useStore} from "vuex";
import {useVuelidate} from "@vuelidate/core";
import AdvanceHeaders from "@/components/advances/AdvanceHeaders.vue";
import AdvanceItems from "@/components/advances/AdvanceItems.vue";
import {AdvanceFull, AdvanceHeaders as AdvanceHeadersType, AdvanceItem, GenericFile} from "@/types";

export default defineComponent({
    name: "AdvanceEditor",
    components: {
        Tabs,
        Tab,
        ButtonField,
        FilesList,
        AdvanceHeaders,
        AdvanceItems,
    },
    props: {
        uuid: {
            type: String,
            required: false
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    setup(props) {
        const headers = ref<AdvanceHeadersType>({
            organization_uuid: '',
            employee_uuid: '',
            purpose_uuid: '',
            basis_uuid: '',
        })
        const items = ref<AdvanceItem[]>([])
        const files = ref<GenericFile[]>([])
        const can_save_as_draft = ref(false)

        const setAdvanceDataFromResponse = (response: AdvanceFull) => {
            items.value = response.items
            files.value = response.files
        }
        if (props.uuid) {
            onMounted(async () => {
                const response = await backendService.advanceShow(props.uuid as string)
                headers.value.organization_uuid = response.organization_uuid
                headers.value.employee_uuid = response.employee_uuid
                headers.value.purpose_uuid = response.purpose_uuid
                headers.value.basis_uuid = response.basis_uuid
                can_save_as_draft.value = response.is_draft
                setAdvanceDataFromResponse(response)
            })
        } else {
            onMounted(async () => {
                const store = useStore()
                await store.state.bootstrap.bootstrapFinished
                headers.value.organization_uuid = store.state.bootstrap.user.organization_uuid
                headers.value.employee_uuid = store.state.bootstrap.user.uuid
                can_save_as_draft.value = true
            })
        }

        const v$ = useVuelidate()

        const headersErrors = computed(() => (v$.value.$errors.filter((error) => error.$propertyPath.startsWith('headers.')).length !== 0))
        const itemsErrors = computed(() => (v$.value.$errors.filter((error) => error.$propertyPath.startsWith('item.')).length !== 0))

        const router = useRouter()
        const closeDocument = (is_draft = false) => {
            if (is_draft) {
                router.push({
                    name: 'advance-drafts',
                })
            } else {
                router.push({
                    name: 'advance-list',
                })
            }
        }
        const saveDocument = async (is_draft: boolean) => {
            v$.value.$touch()
            if (v$.value.$error) return

            if (props.uuid) {
                await backendService.advanceUpdate(props.uuid, headers.value, items.value, files.value, is_draft)
            } else {
                await backendService.advanceCreate(headers.value, items.value, files.value, is_draft)
            }
            closeDocument(is_draft)
        }

        return {
            headers,
            items,
            files,
            can_save_as_draft,
            saveDocument,
            closeDocument,
            headersErrors,
            itemsErrors,
        }
    }
})
</script>