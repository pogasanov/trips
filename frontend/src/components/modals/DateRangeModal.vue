<template>
    <vue-final-modal
        v-slot="{ params, close }"
        v-bind="$attrs"
        classes="flex justify-center items-center"
        content-class="relative flex flex-col max-h-full mx-4 p-4 border dark:border-gray-800 rounded bg-white dark:bg-gray-900"
    >
    <span class="mr-8 text-2xl font-bold">
      <slot name="title"></slot>
    </span>
        <div class="flex-grow overflow-y-auto">
            <div class="flex justify-center gap-5 mb-3">
                <div class="flex items-center gap-4">
                    <input-field
                        id="filterFrom"
                        class="border-blue-300"
                        v-model="filterFrom"
                        type="date"
                    >От
                    </input-field>
                </div>
                <div class="flex items-center gap-4">
                    <input-field
                        id="filterTo"
                        class="border-blue-300"
                        v-model="filterTo"
                        type="date"
                    >До
                    </input-field>
                </div>
                <div>
                    <button-field
                        @click="refresh()"
                        class="inline-flex items-center p-2"
                        :class="{'cursor-not-allowed text-opacity-50': loadingItems}"
                    >
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" v-if="loadingItems">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Обновить
                    </button-field>
                </div>
                <div>
                    <button-field
                        @click.once="confirmModal(close)"
                    >Подтвердить
                    </button-field>
                </div>
            </div>
            <slot :params="params">
                <div class="overflow-x-hidden overflow-y-auto" style="height: calc(100vh - 320px)"
                >
                    <table class="table-fixed w-full">
                        <thead class="text-sm leading-3">
                        <tr>
                            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Вид входящего
                                документа
                            </th>
                            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Дата входящего
                                документа
                            </th>
                            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Номер СФ</th>
                            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Дата СФ</th>
                            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Поставщик</th>
                            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Содержание</th>
                            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Количество</th>
                            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Цена с НДС</th>
                            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Сумма с НДС</th>
                            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Ставка НДС</th>
                            <th class="leading-4 sticky top-0 bg-white border border-black sticky z-10">Сумма НДС</th>
                        </tr>
                        </thead>
                        <tbody>
                        <DateRangeModalRow
                            :key="index"
                            v-for="(item, index) in items"
                            :item="item"
                            :selected="selectedItemsIndexes.has(index)"
                            @click="selectedItemsIndexes.has(index) ? selectedItemsIndexes.delete(index) : selectedItemsIndexes.add(index)"
                        />
                        </tbody>
                    </table>
                </div>
            </slot>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import {VueFinalModal} from "vue-final-modal";
import InputField from "@/components/reusable/InputField.vue";
import {defineComponent, ref} from "vue";
import {AdvanceItem} from "@/types";
import DateRangeModalRow from "@/components/modals/DateRangeModalRow.vue";
import ButtonField from "@/components/reusable/ButtonField.vue";

export default defineComponent({
    name: "DateRangeModal",
    components: {
        DateRangeModalRow,
        VueFinalModal,
        InputField,
        ButtonField,
    },
    emits: ['itemSelected'],
    props: {
        fetchItems: {
            type: Function,
            required: true,
        },
    },
    setup(props, {emit}) {
        const items = ref<AdvanceItem[]>([]),
            selectedItemsIndexes = ref(new Set()),
            filterFrom = ref(''),
            filterTo = ref('')

        const loadingItems = ref(false)
        const refresh = async () => {
            if (!loadingItems.value && filterFrom.value && filterTo.value) {
                loadingItems.value = true;
                selectedItemsIndexes.value.clear()
                items.value = await props.fetchItems({filterFrom: filterFrom.value, filterTo: filterTo.value})
                loadingItems.value = false;
            }
        }

        const confirmModal = (close: () => void) => {
            emit('itemSelected', items.value.filter((item, index) => selectedItemsIndexes.value.has(index)), close)
        }

        return {
            items,
            selectedItemsIndexes,
            filterFrom,
            filterTo,
            loadingItems,
            refresh,
            confirmModal,
        }
    }
})
</script>