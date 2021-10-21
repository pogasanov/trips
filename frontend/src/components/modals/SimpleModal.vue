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
                            v-for="item in fetched_items"
                            class="hover:bg-purple-700 hover:text-white cursor-pointer"
                            @click="$emit('itemSelected', item, close)"
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
import {defineComponent, onMounted, ref} from "vue";
import {Option} from "@/types";
import {VueFinalModal} from "vue-final-modal";

export default defineComponent({
    name: "DefaultModal",
    components: {
        VueFinalModal,
    },
    emits: ['itemSelected'],
    props: {
        items: {
            type: [Array, Function],
            required: true,
        }
    },
    setup(props) {
        const fetched_items = ref<Option[]>([])
        onMounted(async () => {
            if (typeof props.items === 'function') {
                fetched_items.value = await props.items();
            } else {
                fetched_items.value = props.items as Option[]
            }
        })

        return {
            fetched_items,
        }
    }
})
</script>