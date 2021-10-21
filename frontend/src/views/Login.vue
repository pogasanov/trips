<template>
    <div class="w-full max-w-sm mx-auto">
        <img alt="Vue logo" src="../assets/logo.png" class="mx-auto">
        <form v-if="!pinRequested" @submit.prevent="requestPin">
            <input-field
                v-model="username"
                :errors="v$.username.$errors"
                id="username"
            >Имя пользователя
            </input-field>

            <button-field
                class="px-2 py-2 mt-3"
            >Запросить пин
            </button-field>
        </form>
        <form v-else @submit.prevent="login">
            <input-field
                v-model="pin"
                :errors="v$.pin.$errors"
                id="pin"
            >Пин код
            </input-field>

            <button-field
                class="px-2 py-2 mt-3"
            >Войти
            </button-field>
        </form>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, ref} from "vue";
import InputField from "@/components/reusable/InputField.vue";
import ButtonField from "@/components/reusable/ButtonField.vue";
import {useVuelidate} from '@vuelidate/core'
import {required, helpers} from '@vuelidate/validators'
import {useRouter} from "vue-router";
import {useStore} from "vuex";

export default defineComponent({
    name: "Login",
    components: {
        InputField,
        ButtonField
    },
    setup: () => {
        const username = ref('')
        const pin = ref('')
        const pinRequested = ref(false)
        const error = ref('')

        const goToDashboardPage = () => {
            router.push({name: 'trip-list'})
        }

        const rules = computed(() => ({
            username: {required: helpers.withMessage('Введите имя пользователя', required),},
            pin: {required: helpers.withMessage('Введите пин код', required),},
        }))
        const v$ = useVuelidate(rules, {
            username,
            pin,
        })
        const store = useStore()
        const router = useRouter()
        const requestPin = () => {
            v$.value.username.$touch();
            if (!v$.value.username.$error) {
                store.dispatch('auth/requestPin', username.value)
                    .then(() => {
                        error.value = '';
                        pinRequested.value = true;
                    })
                    .catch((received_error) => {
                        error.value = received_error.message;
                    })
            }
        }
        const login = () => {
            v$.value.pin.$touch();
            if (!v$.value.pin.$error) {
                store.dispatch('auth/authenticate', pin.value)
                    .then(() => {
                        goToDashboardPage()
                    })
                    .catch((received_error) => {
                        error.value = received_error.message;
                    })
            }
        }
        onMounted(() => {
            if (store.getters['auth/isAuthenticated']) {
                goToDashboardPage()
            }
        })

        return {
            username,
            pin,
            pinRequested,
            error,
            requestPin,
            login,
            v$,
        }
    },
})
</script>