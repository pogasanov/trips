import {AuthState, State} from '@vue/runtime-core'
import {ActionContext} from "vuex";
import backendService from "@/services/backend";

const token_storage_key = 'trip_token';

export default {
    namespaced: true,
    state: (): AuthState => ({
        name: '',
        token: localStorage.getItem(token_storage_key)
    }),
    mutations: {
        setName(state: AuthState, name: string): void {
            state.name = name;
        },
        setToken(state: AuthState, token: string): void {
            state.token = token;
            localStorage.setItem(token_storage_key, token);
        },
        removeToken(state: AuthState): void {
            state.token = null;
            localStorage.removeItem(token_storage_key);
        }
    },
    actions: {
        requestPin({commit}: ActionContext<AuthState, State>, name: string): Promise<void> {
            commit('setName', name);
            return backendService.pin(name);
        },
        authenticate({commit, state}: ActionContext<AuthState, State>, pin: string): Promise<void> {
            return backendService.login(state.name, pin).then((response) => {
                commit('setToken', response.token);
            })
        },
        logout({commit}: ActionContext<AuthState, State>): void {
            commit('removeToken');
            window.location.reload();
        }
    },
    getters: {
        isAuthenticated: (state: AuthState): boolean => {
            return state.token !== null
        }
    }
}