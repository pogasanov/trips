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
            <trip-headers
                v-model="headers"
                :disabled="disabled"
                @update_basis_uuid="updateFromBasisTrip"
            ></trip-headers>
        </tab>
        <tab name="Маршрут" id="route" :has-error="routesErrors">
            <trip-routes
                v-model="routes"
                :disabled="disabled"
            ></trip-routes>
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
import TripHeaders from '@/components/trips/TripHeaders.vue';
import backendService from "@/services/backend";
import TripRoutes from '@/components/trips/TripRoutes.vue';
import {useStore} from "vuex";
import {useVuelidate} from "@vuelidate/core";
import {GenericFile, TripFull, TripHeaders as TripHeadersType, TripRoute} from "@/types";

export default defineComponent({
    name: "TripEditor",
    components: {
        Tabs,
        Tab,
        ButtonField,
        TripHeaders,
        TripRoutes,
        FilesList,
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
        const headers = ref<TripHeadersType>({
            type: '',
            basis_uuid: '',
            basis_update_reason: '',
            organization_uuid: '',
            employee_uuid: '',
            destination_organization: '',
            destination_city: '',
            errand: '',
            date_start: '',
            date_end: '',
            price_tickets: 0,
            price_living: 0,
            per_diem_rate_uuid: '',
            smartway_codes_count: 1,
        })
        const routes = ref<TripRoute[]>([])
        const files = ref<GenericFile[]>([])
        const can_save_as_draft = ref(false)

        const setTripDataFromResponse = (response: TripFull) => {
            headers.value.organization_uuid = response.organization_uuid
            headers.value.employee_uuid = response.employee_uuid
            headers.value.destination_organization = response.destination_organization
            headers.value.destination_city = response.destination_city
            headers.value.errand = response.errand
            headers.value.date_start = response.date_start
            headers.value.date_end = response.date_end
            headers.value.price_tickets = response.price_tickets
            headers.value.price_living = response.price_living
            headers.value.per_diem_rate_uuid = response.per_diem_rate_uuid
            headers.value.smartway_codes_count = response.smartway_codes_count

            routes.value = response.routes
        }
        if (props.uuid) {
            onMounted(async () => {
                const response = await backendService.tripShow(props.uuid as string)
                headers.value.type = response.type
                headers.value.basis_uuid = response.basis_uuid
                headers.value.basis_update_reason = response.basis_update_reason
                files.value = response.files
                can_save_as_draft.value = response.is_draft
                setTripDataFromResponse(response)
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

        const updateFromBasisTrip = async (new_base_uuid: string) => {
            const response = await backendService.tripShow(new_base_uuid)
            setTripDataFromResponse(response)
        }

        const v$ = useVuelidate()

        const headersErrors = computed(() => (v$.value.$errors.filter((error) => error.$propertyPath.startsWith('headers.')).length !== 0))
        const routesErrors = computed(() => (v$.value.$errors.filter((error) => error.$propertyPath.startsWith('item.')).length !== 0))

        const router = useRouter()
        const closeDocument = (is_draft = false) => {
            if (is_draft) {
                router.push({
                    name: 'trip-drafts',
                })
            } else {
                router.push({
                    name: 'trip-list',
                })
            }
        }

        const saveDocument = async (is_draft: boolean) => {
            v$.value.$touch()

            if (v$.value.$error) return

            if (props.uuid) {
                await backendService.tripUpdate(props.uuid, headers.value, routes.value, files.value, is_draft)
            } else {
                await backendService.tripCreate(headers.value, routes.value, files.value, is_draft)
            }
            closeDocument(is_draft)
        }

        return {
            headers,
            routes,
            files,
            can_save_as_draft,
            saveDocument,
            closeDocument,
            updateFromBasisTrip,
            headersErrors,
            routesErrors,
        }
    }
})
</script>