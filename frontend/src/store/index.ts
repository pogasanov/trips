import {createStore} from 'vuex'
import auth from "@/store/modules/auth";
import bootstrap from "@/store/modules/bootstrap";

export default createStore({
    modules: {
        auth,
        bootstrap,
    },
})