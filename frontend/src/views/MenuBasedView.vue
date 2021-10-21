<template>
    <div class="flex h-screen">
        <div
            :class="{
      'w-navbar': sidebarOpen,
      'w-10': !sidebarOpen
    }"
            data-testid="navbar"
            class="transition-all duration-500 overflow-hidden bg-blue-500 flex flex-col relative flex">
            <div>
                <div
                    class="w-10"
                >
                    <ButtonField
                        @click="toggleSidebar"
                        aria-label="toggle sidebar"
                        class="p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                             class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </ButtonField>
                </div>
            </div>

            <ul class="py-3 text-gray-300 min-w-navbar overflow-y-auto overflow-x-hidden h-full">
                <menu-link route-name="trip-list">Список отправленных заявок на командировку/изменений условий
                    командировки
                </menu-link>
                <menu-link route-name="trip-create">Создать заявку на командировку/изменения условий командировки
                </menu-link>
                <menu-link route-name="trip-drafts">Черновики заявок на командировку/изменений условий командировки
                </menu-link>

                <menu-link route-name="advance-list">Список отправленных авансовых отчетов</menu-link>
                <menu-link route-name="advance-create">Создать авансовый отчет</menu-link>
                <menu-link route-name="advance-drafts">Черновики авансовых отчетов</menu-link>
            </ul>
        </div>
        <div class="flex-1 h-screen overflow-hidden ml-1">
            <div class="flex justify-end items-center">
                <span class="mr-3"> Текущий пользователь: {{ $store.state.bootstrap.user.name }}</span>
                <button-field
                    @click="logout"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                         class="w-4 mr-1 inline flex-growth-0 flex-shrink-0">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Выйти
                </button-field>
            </div>

            <router-view :key="$route.fullPath" class="overflow-y-auto overflow-x-auto"
                         style="height: calc(100vh - 110px)"></router-view>
        </div>
    </div>
</template>

<script lang="ts">
import MenuLink from '@/components/reusable/MenuLink.vue'
import ButtonField from "@/components/reusable/ButtonField.vue";
import {defineComponent, onMounted, ref} from "vue";
import {useStore} from "vuex";

export default defineComponent({
    name: "MenuBasedView",
    components: {
        MenuLink,
        ButtonField
    },
    setup() {
        const sidebarOpen = ref(localStorage.getItem('sidebarOpen') !== null ? localStorage.getItem('sidebarOpen') !== "false" : true)

        const $store = useStore()
        onMounted(() => {
            $store.dispatch('bootstrap/bootstrap')
        })

        const toggleSidebar = () => {
            sidebarOpen.value = !sidebarOpen.value;
            localStorage.setItem('sidebarOpen', sidebarOpen.value.toString());
        }
        const logout = () => {
            $store.dispatch('auth/logout')
        }
        return {
            sidebarOpen,
            toggleSidebar,
            logout,
        }
    },
    methods: {}
})
</script>