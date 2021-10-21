import { Store } from 'vuex'
import {Option, Organization, PerDiemRate, UserInfo} from "@/types";

declare module '@vue/runtime-core' {
    // declare your own store states
    interface State {
        auth: AuthState,
        bootstrap: BootstrapState
    }

    interface AuthState {
        name: string,
        token: string | null
    }

    interface BootstrapState {
        is_loading: boolean,
        user: UserInfo,
        organizations: Organization[],
        users: UserInfo[],
        partners: Option[],
        bootstrapFinished: Promise,
        trip_type_options: Option[],
        per_diem_rates: PerDiemRate[],
    }

    // provide typings for `this.$store`
    interface ComponentCustomProperties {
        $store: Store<State>
    }
}