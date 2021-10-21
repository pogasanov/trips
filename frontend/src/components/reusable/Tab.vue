<template>
    <section v-show="isActive"
             :aria-hidden="!isActive"
             :id="computedId"
             role="tabpanel"
             ref="tab"
    >
        <slot/>
    </section>
</template>

<script lang="ts">
import {inject, watch, ref, onBeforeMount, defineComponent} from 'vue';
import {TabsType} from "@/components/reusable/Tabs.vue";

export interface TabType {
    name: string,
    hash: string,
    hasError: boolean,
    isActive?: boolean,
    isDisabled: boolean,
    index: number,
}

export default defineComponent({
    name: 'Tab',
    props: {
        id: {
            type: String,
            default: null
        },
        name: {
            type: String,
            required: true
        },
        isDisabled: {
            type: Boolean,
            default: false
        },
        hasError: {
            type: Boolean,
            default: false
        },
    },
    setup(props) {
        const isActive = ref(false)
        const tabsProvider = inject<TabsType>('tabsProvider')
        const computedId = props.id ? props.id : props.name.toLowerCase().replace(/ /g, '-')
        const hash = '#' + (!props.isDisabled ? computedId : '')

        if (tabsProvider) {
            watch(
                () => tabsProvider.activeTabHash,
                () => {
                    isActive.value = hash === tabsProvider.activeTabHash
                }
            )
            watch(
                () => props.hasError,
                (val) => {
                    const item = tabsProvider.tabs.find(tab => tab.hash === hash)
                    if (item) item.hasError = val
                }
            )
            onBeforeMount(() => {
                tabsProvider.tabs.push({
                    name: props.name,
                    isDisabled: props.isDisabled,
                    hash: hash,
                    index: tabsProvider.tabs.length,
                    hasError: props.hasError,
                })
            })
        }

        return {
            computedId,
            hash,
            isActive
        }
    }
})
</script>