import {onMounted, watch, Ref, shallowRef} from "vue";
import {SetupContext} from "@vue/runtime-core";

export const useGenericItemRow = <T>(
    props: Readonly<{modelValue: T}>,
    context: SetupContext<('update:modelValue' | 'delete-row')[]>,
): {
    item: Ref<T | Record<string, never>>,
    deleteRow: () => void,
} => {
    const item = shallowRef<T | Record<string, never>>({})
    onMounted(() => {
        item.value = props.modelValue
    })

    watch(item, (newValue) => {
        context.emit('update:modelValue', newValue)
    })
    watch(() => props.modelValue, (newValue) => {
        item.value = newValue
    })

    const deleteRow = () => {
        context.emit('delete-row')
    }

    return {
        item,
        deleteRow
    }
}