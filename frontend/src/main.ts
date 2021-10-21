import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import SimpleModal from '@/components/modals/SimpleModal.vue'
import DefaultModal from '@/components/modals/DefaultModal.vue'
import DateRangeModal from '@/components/modals/DateRangeModal.vue'
import NotificationModal from "@/components/modals/NotificationModal.vue";
import './index.css'

createApp(App)
    .use(store)
    .use(router)
    .component('SimpleModal', SimpleModal)
    .component('DefaultModal', DefaultModal)
    .component('DateRangeModal', DateRangeModal)
    .component('NotificationModal', NotificationModal)
    .mount('#app')
