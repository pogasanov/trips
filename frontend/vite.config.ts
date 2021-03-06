import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import path from 'path'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd())

    // expose .env as process.env instead of import.meta since jest does not import meta yet
    const envWithProcessPrefix = Object.entries(env).reduce(
        (prev, [key, val]) => {
            return {
                ...prev,
                ['process.env.' + key]: `"${val}"`,
            }
        },
        {},
    )

    return {
        base: env.PROD ? '/trips/' : '',
        define: envWithProcessPrefix,
        plugins: [vue()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '/src'),
            },
        }
    }
})