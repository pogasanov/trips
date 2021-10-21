<template>
    <div class="w-3/4 mx-auto">
        <table class="table-fixed w-full">
            <thead>
            <tr>
                <th class="w-2/12 px-4 py-2">Номер</th>
                <th class="w-2/12 px-4 py-2">Дата</th>
                <th class="w-2/12 px-4 py-2">Наименование документа</th>
                <th class="w-1/12 px-4 py-2">Вид документа</th>
                <th class="w-2/12 px-4 py-2"></th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="item in items"
                :key="item.uuid"
                class="hover:bg-blue-300 hover:cursor-pointer"
            >
                <td class="border px-4 py-2 break-words" @click="editItem(item)">
                    {{ item.number }}
                </td>
                <td class="border px-4 py-2 break-words" @click="editItem(item)">
                    {{ item.date }}
                </td>
                <td class="border px-4 py-2 break-words" @click="editItem(item)">
                    {{ item.name }}
                </td>
                <td class="border px-4 py-2 break-words" @click="editItem(item)">
                    {{ item.type }}
                </td>
                <td class="border px-4 py-2 break-words">
                    <button-field
                        @click="deleteItem(item)"
                    >
                        Удалить
                    </button-field>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import {defineComponent, ref, onMounted} from 'vue';
import ButtonField from "@/components/reusable/ButtonField.vue";
import backendService from "@/services/backend";
import {useRouter} from "vue-router";
import {TripCommon} from "@/types";

export default defineComponent({
    name: "TripDrafts",
    components: {
        ButtonField
    },
    setup() {
        const items = ref<TripCommon[]>([])
        const getItemsList = async () => {
            items.value = await backendService.tripDrafts();
        }
        onMounted(getItemsList)

        const router = useRouter()
        const editItem = (item: TripCommon) => {
            router.push({
                name: 'trip-edit',
                params: {
                    uuid: item.uuid
                },
            })
        }
        const deleteItem = async (item: TripCommon) => {
            await backendService.tripDelete(item.uuid);
            await getItemsList();
        }

        return {
            items,
            getItemsList,
            editItem,
            deleteItem,
        }
    }
})
</script>