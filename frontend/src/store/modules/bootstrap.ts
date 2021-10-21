import {BootstrapState, State} from '@vue/runtime-core'
import {ActionContext} from "vuex";
import backendService from "@/services/backend";
import {Option, Organization, PerDiemRate, UserInfo} from "@/types";

let outsideResolve: ((value: unknown) => void);

export default {
    namespaced: true,
    state: (): BootstrapState => ({
        is_loading: false,

        user: {
            uuid: '',
            name: '',
            organization_uuid: '',
        },
        organizations: [],
        users: [],
        partners: [],
        per_diem_rates: [],
        bootstrapFinished: new Promise((resolve => {
            outsideResolve = resolve
        })),

        trip_type_options: [
            {
                uuid: 'Заявка на командировку',
                name: 'Заявка на командировку',
            },
            {
                uuid: 'Изменение условий командировки',
                name: 'Изменение условий командировки',
            }
        ]
    }),
    getters: {
        perDiemRateAsOptions: (state: BootstrapState): Option[] => {
            return state.per_diem_rates.map(rate => ({uuid: rate.uuid, name: `${rate.name} (${rate.rate})`}));
        },

        getOrganizationByUuid: (state: BootstrapState) => (uuid: string): Organization | undefined => {
            return state.organizations.find(organization => organization.uuid === uuid)
        },
        getUserByUuid: (state: BootstrapState) => (uuid: string): UserInfo | undefined => {
            return state.users.find(user => user.uuid === uuid)
        },
    },
    mutations: {
        setUser(state: BootstrapState, user: UserInfo): void {
            state.user = user;
        },
        setUsers(state: BootstrapState, users: UserInfo[]): void {
            state.users = users;
        },
        setOrganizations(state: BootstrapState, organizations: Organization[]): void {
            state.organizations = organizations;
        },
        setPartners(state: BootstrapState, partners: Option[]): void {
            state.partners = partners;
        },
        setPerDiemRates(state: BootstrapState, per_diem_rates: PerDiemRate[]): void {
            state.per_diem_rates = per_diem_rates;
        },
        toggleLoading(state: BootstrapState): void {
            state.is_loading = !state.is_loading
        },
    },
    actions: {
        bootstrap({commit, state}: ActionContext<BootstrapState, State>): Promise<void> {
            outsideResolve(backendService.bootstrap().then((response) => {
                commit('setUser', response.user);
                commit('setOrganizations', response.organizations);
                commit('setPartners', response.partners);
                commit('setUsers', response.users);
                commit('setPerDiemRates', response.per_diem_rates);
            }));
            return state.bootstrapFinished
        },
    },
}