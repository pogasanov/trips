<template>
    <div class="w-3/4 mx-auto">
        <table class="table-fixed w-full">
            <thead>
            <tr>
                <th class="w-2/12 px-4 py-2">Номер</th>
                <th class="w-2/12 px-4 py-2">Дата</th>
                <th class="w-2/12 px-4 py-2">Наименование документа</th>
                <th class="w-2/12 px-4 py-2">Статус согласования</th>
                <th class="w-1/12 px-4 py-2">Состояние согласования</th>
                <th class="w-1/12 px-4 py-2">Сумма</th>
                <th class="w-2/12 px-4 py-2"></th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="item in items"
                :key="item.uuid"
                :class="{'hover:bg-blue-300 hover:cursor-pointer': item.is_editable}"
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
                    {{ item.status }}
                </td>
                <td class="border px-4 py-2 break-words" @click="editItem(item)">
                    {{ item.condition }}
                </td>
                <td class="border px-4 py-2 break-words" @click="editItem(item)">
                    {{ item.total_price }}
                </td>
                <td class="border px-4 py-2 break-words">
                    <div class="flex flex-col gap-0.5 items-center">
                        <button-field
                            v-if="!item.is_editable"
                            @click="showItem(item)"
                        >
                            Просмотр
                        </button-field>
                        <file-field
                            :id="`file-${item.uuid}`"
                            @change="updateFile(item, $event)"
                        >Добавить файл
                        </file-field>
                        <button-field
                            @click="deleteItem(item)"
                        >
                            Удалить
                        </button-field>
                    </div>
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
import FileField from '@/components/reusable/FileField.vue';
import {AdvanceCommon, GenericFile, TripCommon} from "@/types";

export default defineComponent({
    name: "AdvanceList",
    components: {
        ButtonField,
        FileField,
    },
    setup() {
        const items = ref<AdvanceCommon[]>([])
        const getItemsList = async () => {
            items.value = await backendService.advanceList();
        }
        onMounted(getItemsList)

        const router = useRouter()
        const editItem = (item: AdvanceCommon) => {
            if (!item.is_editable) {
                return;
            }
            router.push({
                name: 'advance-edit',
                params: {
                    uuid: item.uuid
                },
            })
        }
        const showItem = (item: AdvanceCommon) => {
            router.push({
                name: 'advance-show',
                params: {
                    uuid: item.uuid
                },
            })
        }
        const deleteItem = async (item: AdvanceCommon) => {
            await backendService.advanceDelete(item.uuid);
            await getItemsList();
        }

        const updateFile = async (item: AdvanceCommon, file: GenericFile) => {
            await backendService.advanceAddFile(item.uuid, file);
        }

        return {
            items,
            getItemsList,
            editItem,
            showItem,
            deleteItem,
            updateFile,
        }
    }
})
</script>