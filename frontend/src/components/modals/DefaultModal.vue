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
            <input-field
                placeholder="Поиск"
                class="border-blue-300"
                role="searchbox"
                v-model="filter"
            ></input-field>
            <slot :params="params">
                <div class="overflow-x-hidden overflow-y-auto" style="height: calc(100vh - 320px)"
                >
                    <table class="table-fixed w-full">
                        <thead class="text-sm leading-3">
                        <tr>
                            <th>Название</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr :key="item.uuid"
                            v-for="item in filteredItems"
                            class="hover:bg-purple-700 hover:text-white cursor-pointer"
                            @click="$emit('itemSelected', item.uuid, close)"
                        >
                            <td class="border px-4 py-2">{{ item.name }}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </slot>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import InputField from "@/components/reusable/InputField.vue";
import {computed, defineComponent, PropType, ref} from "vue";
import {VueFinalModal} from 'vue-final-modal';
import {Option} from "@/types";

export default defineComponent({
    name: "DefaultModal",
    components: {
        VueFinalModal,
        InputField,
    },
    emits: ['itemSelected'],
    props: {
        items: {
            type: Array as PropType<Option[]>,
            required: true,
        }
    },
    setup(props) {
        const filter = ref('')
        const filteredItems = computed(() => {
            return props.items.filter(item => item.name.toLowerCase().includes(filter.value.toLowerCase()))
        })

        return {
            filter,
            filteredItems,
        }
    }
})
</script>