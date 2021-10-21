import store from '@/store';
import {
    AdvanceCommon,
    Bootstrap,
    Expenditure,
    Option,
    TripCommon,
    GenericFile,
    TripFull,
    TripHeaders,
    TripRoute, AdvanceHeaders, AdvanceFull, AdvanceItem
} from "@/types";
import {$vfm} from "vue-final-modal";

function makeFetchRequest(endpoint: string, body: Record<string, unknown>, method = 'POST', toggleLoading = true) {
    if (toggleLoading) {
        store.commit('bootstrap/toggleLoading');
    }

    const url = new URL(`${process.env.VITE_APP_BACKEND_URL}/${endpoint}`);
    const options: {
        method: string,
        headers: Record<string, string>,
        body?: string
    } = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    };
    if (method === 'GET') {
        Object.keys(body).forEach(key => url.searchParams.append(key, body[key] as string))
    } else {
        options.body = JSON.stringify(body);
    }

    if (store.getters['auth/isAuthenticated']) {
        options.headers.Authorization = `Bearer ${store.state.auth.token}`
    }

    return fetch(url.toString(), options).catch((e) => {
        console.error(e)
        if (toggleLoading) {
            store.commit('bootstrap/toggleLoading');
        }
        throw new Error('Не получается получить данные от сервера. Попробуйте позже.')
    }).then(async (response) => {
        if (toggleLoading) {
            store.commit('bootstrap/toggleLoading');
        }
        if (!response.ok) {
            if (!['pin', 'login'].includes(endpoint) && response.status === 401) {
                store.dispatch('auth/logout');
            }

            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                data = await response.text();
            }
            const text = data ? data : 'Неизвестная ошибка сервера. Попробуйте позже.';
            throw Error(text);
        } else {
            const text = await response.text();
            if (text) {
                return JSON.parse(text);
            }
        }
    }).catch((e) => {
        $vfm.show({
            component: 'NotificationModal',
            bind: {
                title: 'Ошибка запроса',
                content: e.message,
            }
        })
        throw e;
    });
}

const tripEndpoints = {
    tripList(): Promise<TripCommon[]> {
        return makeFetchRequest('trip', {}, 'GET')
    },
    tripDrafts(): Promise<TripCommon[]> {
        return makeFetchRequest('trip', {is_draft: '1'}, 'GET')
    },
    tripShow(uuid: string): Promise<TripFull> {
        return makeFetchRequest(`trip/${uuid}`, {}, 'GET')
    },
    tripDelete(uuid: string): Promise<Record<string, never>> {
        return makeFetchRequest(`trip/${uuid}`, {}, 'DELETE')
    },
    tripAddFile(uuid: string, file: GenericFile): Promise<void> {
        return makeFetchRequest(`trip/${uuid}/file`, {...file}, 'POST')
    },
    tripCreate(headers: TripHeaders, routes: TripRoute[], files: GenericFile[], is_draft: boolean): Promise<string> {
        return makeFetchRequest('trip', {
            ...headers,
            routes,
            files,
            is_draft: is_draft ? '1' : '0'
        }, 'POST')
    },
    tripUpdate(uuid: string, headers: TripHeaders, routes: TripRoute[], files: GenericFile[], is_draft: boolean): Promise<string> {
        return makeFetchRequest(`trip/${uuid}`, {
            ...headers,
            routes,
            files,
            is_draft: is_draft ? '1' : '0'
        }, 'PUT')
    },
    tripBasisList(): Promise<Option[]> {
        return makeFetchRequest('trip/basis', {}, 'GET')
    },
}

const advanceEndpoints = {
    advanceList(): Promise<AdvanceCommon[]> {
        return makeFetchRequest('advance', {}, 'GET')
    },
    advanceDrafts(): Promise<AdvanceCommon[]> {
        return makeFetchRequest('advance', {is_draft: '1'}, 'GET')
    },
    advanceShow(uuid: string): Promise<AdvanceFull> {
        return makeFetchRequest(`advance/${uuid}`, {}, 'GET')
    },
    advanceDelete(uuid: string): Promise<Record<string, never>> {
        return makeFetchRequest(`advance/${uuid}`, {}, 'DELETE')
    },
    advanceAddFile(uuid: string, file: GenericFile): Promise<void> {
        return makeFetchRequest(`advance/${uuid}/file`, {...file}, 'POST')
    },
    advanceCreate(headers: AdvanceHeaders, items: AdvanceItem[], files: GenericFile[], is_draft: boolean): Promise<string> {
        return makeFetchRequest('advance', {
            ...headers,
            items,
            files,
            is_draft: is_draft ? '1' : '0'
        }, 'POST')
    },
    advanceUpdate(uuid: string, headers: AdvanceHeaders, items: AdvanceItem[], files: GenericFile[], is_draft: boolean): Promise<string> {
        return makeFetchRequest(`advance/${uuid}`, {
            ...headers,
            items,
            files,
            is_draft: is_draft ? '1' : '0'
        }, 'PUT')
    },
    advancePurposeList(): Promise<Expenditure[]> {
        return makeFetchRequest('advance/purpose', {}, 'GET')
    },
    advanceFillUsingBasis(filters: { filterFrom: string, filterTo: string }): Promise<AdvanceItem[]> {
        return makeFetchRequest('advance/fill', {
            from: filters.filterFrom,
            to: filters.filterTo,
        }, 'GET', false);
    }
}

const backendService = {
    pin(name: string): Promise<void> {
        return makeFetchRequest('pin', {
            name: name
        });
    },
    login(name: string, pin: string): Promise<{ token: string }> {
        return makeFetchRequest('login', {
            name: name,
            pin: pin
        });
    },

    bootstrap(): Promise<Bootstrap> {
        return makeFetchRequest('bootstrap', {}, 'GET')
    },

    ...tripEndpoints,
    ...advanceEndpoints,
};

export default backendService