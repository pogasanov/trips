<template>
    <div class="tabs">
        <ul role="tablist" class="flex mb-3">
            <li
                v-for="(tab, i) in tabs"
                :key="i"
                class="flex-1 mr-2"
                role="presentation"
            >
                <a v-html="tab.name"
                   :aria-controls="tab.hash"
                   :aria-selected="tab.isActive"
                   @click="selectTab(tab.hash, $event)"
                   :href="tab.hash"
                   :class="classObject(tab)"
                   class="text-center block border rounded py-2 px-4 text-white"
                   role="tab"
                ></a>
            </li>
        </ul>

        <slot/>
    </div>
</template>

<script lang="ts">
import expiringStorage from '../expiringStorage';
import {reactive, provide, onMounted, toRefs, defineComponent} from 'vue';
import {TabType} from "@/components/reusable/Tab.vue";

export type TabsType = {
    activeTabHash: string,
    lastActiveTabHash: string,
    tabs: TabType[]
}

export default defineComponent({
    props: {
        cacheLifetime: {
            default: 5,
        },
        options: {
            type: Object,
            required: false,
            default: () => ({
                useUrlFragment: false,
                defaultTabHash: null,
            }),
        },
    },
    emits: ['changed', 'clicked'],
    setup(props, context) {
        const classObject = (tab: TabType) => {
            let classes = [];
            if (tab.hasError) {
                if (tab.isActive) {
                    classes.push('border-red-700 bg-red-700')
                } else {
                    classes.push('border-red-500 bg-red-500 hover:bg-red-700')
                }
            } else {
                if (tab.isActive) {
                    classes.push('border-blue-700 bg-blue-700')
                } else {
                    classes.push('border-blue-500 bg-blue-500 hover:bg-blue-700')
                }
            }
            return classes;
        }

        const state = reactive<TabsType>({
            activeTabHash: '',
            lastActiveTabHash: '',
            tabs: []
        })
        provide('tabsProvider', state)
        const storageKey = `vue-tabs-component.cache.${window.location.host}${window.location.pathname}`
        const selectTab = (selectedTabHash: string, event: Event | undefined = undefined) => {
            if (event) {
                event.preventDefault();
            }
            const selectedTab = findTab(selectedTabHash);
            if (!selectedTab) {
                return;
            }
            if (selectedTab.isDisabled) {
                event?.preventDefault();
                return;
            }
            if (state.lastActiveTabHash === selectedTab.hash) {
                context.emit('clicked', {tab: selectedTab});
                return;
            }
            state.tabs.forEach(tab => {
                tab.isActive = (tab.hash === selectedTab.hash);
            });
            context.emit('changed', {tab: selectedTab});
            state.lastActiveTabHash = state.activeTabHash = selectedTab.hash;
            expiringStorage.set(storageKey, selectedTab.hash, props.cacheLifetime);
        }
        const findTab = (hash: string) => {
            return state.tabs.find(tab => tab.hash === hash);
        }
        onMounted(() => {
            if (!state.tabs.length) {
                return;
            }
            window.addEventListener('hashchange', () => selectTab(window.location.hash));
            if (findTab(window.location.hash)) {
                selectTab(window.location.hash);
                return;
            }
            const previousSelectedTabHash = expiringStorage.get(storageKey);
            if (findTab(previousSelectedTabHash)) {
                selectTab(previousSelectedTabHash);
                return;
            }
            if (props.options.defaultTabHash && findTab("#" + props.options.defaultTabHash)) {
                selectTab("#" + props.options.defaultTabHash);
                return;
            }
            selectTab(state.tabs[0].hash);
        })
        return {
            ...toRefs(state),
            selectTab,
            findTab,
            classObject
        }
    },
})
</script>