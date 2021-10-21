import {
    createRouter,
    createWebHashHistory,
    Router,
    RouteRecordRaw
} from 'vue-router'
import Login from "@/views/Login.vue";
import TripList from "@/views/trips/TripList.vue";
import TripDrafts from "@/views/trips/TripDrafts.vue";
import TripEditor from "@/views/trips/TripEditor.vue";
import AdvanceList from "@/views/advances/AdvanceList.vue";
import AdvanceDrafts from "@/views/advances/AdvanceDrafts.vue";
import AdvanceEditor from "@/views/advances/AdvanceEditor.vue";
import MenuBasedView from '@/views/MenuBasedView.vue';
import store from '@/store';

const tripRoutes: Array<RouteRecordRaw> = [
    {
        path: '/trip',
        name: 'trip-list',
        component: TripList
    },
    {
        path: '/trip',
        name: 'trip-drafts',
        component: TripDrafts
    },
    {
        path: '/trip/create',
        name: 'trip-create',
        component: TripEditor
    },
    {
        path: '/trip/:uuid/edit',
        name: 'trip-edit',
        component: TripEditor,
        props: true
    },
    {
        path: '/trip/:uuid',
        name: 'trip-show',
        component: TripEditor,
        props: route => ({...route.params, disabled: true}),
    },
]

const advanceRoutes: Array<RouteRecordRaw> = [
    {
        path: '/advance',
        name: 'advance-list',
        component: AdvanceList
    },
    {
        path: '/advance',
        name: 'advance-drafts',
        component: AdvanceDrafts
    },
    {
        path: '/advance/create',
        name: 'advance-create',
        component: AdvanceEditor
    },
    {
        path: '/advance/:uuid/edit',
        name: 'advance-edit',
        component: AdvanceEditor,
        props: true
    },
    {
        path: '/advance/:uuid',
        name: 'advance-show',
        component: AdvanceEditor,
        props: route => ({...route.params, disabled: true}),
    },
]

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'login',
        component: Login,
        meta: {doesntRequiresAuth: true, isFullHeight: true}
    },
    {
        path: '/',
        name: 'root',
        component: MenuBasedView,
        children: [
            ...tripRoutes,
            ...advanceRoutes,
        ]
    }
]

export const createNewRouter = (): Router => {
    const router = createRouter({
        history: createWebHashHistory(process.env.BASE_URL),
        routes
    })
    router.beforeEach((to, from, next) => {
        if (to.matched.some(record => !record.meta.doesntRequiresAuth) && !store.getters['auth/isAuthenticated']) {
            next({name: 'login'})
        } else {
            next()
        }
    })
    return router
}

export default createNewRouter()
