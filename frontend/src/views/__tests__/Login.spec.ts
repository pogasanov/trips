import {render, screen, waitFor} from '@testing-library/vue';
import Component from '../Login.vue';
import userEvent from "@testing-library/user-event";
import store from '@/store';
import {createRouter, createWebHistory} from "vue-router";

const fakeRouter = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'original',
            component: {
                template: ''
            }
        },
        {
            path: '/trip-list',
            name: 'trip-list',
            component: {
                template: ''
            }
        },
    ]
})

describe('Login.vue', () => {
    beforeEach(async () => {
        fetchMock.resetMocks();
        jest.resetModules();
    })

    it('User get option to enter pin when enters valid username', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({}));

        render(Component, {
            global: {
                plugins: [fakeRouter, store],
            }
        })
        await fakeRouter.isReady()

        const usernameField = screen.getByLabelText("Имя пользователя")

        userEvent.type(usernameField, 'Pavel')
        await userEvent.click(screen.getByText('Запросить пин'))
        expect(await screen.findByLabelText('Пин код')).toBeInTheDocument()
        expect(usernameField).not.toBeInTheDocument()
    })

    it('Triggers form submit using enter', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({}));

        render(Component, {
            global: {
                plugins: [fakeRouter, store],
            }
        })
        await fakeRouter.isReady()

        const usernameField = screen.getByLabelText("Имя пользователя")

        userEvent.type(usernameField, 'Pavel')
        await userEvent.keyboard('{enter}')
        expect(await screen.findByLabelText('Пин код')).toBeInTheDocument()
        expect(usernameField).not.toBeInTheDocument()
    })

    it('User gets error when trying to enter without username', async () => {
        render(Component, {
            global: {
                plugins: [fakeRouter, store],
            }
        })
        await fakeRouter.isReady()

        expect(screen.queryByText('Введите имя пользователя')).not.toBeInTheDocument()
        const usernameField = screen.getByLabelText("Имя пользователя")
        await userEvent.click(screen.getByText('Запросить пин'))
        expect(screen.queryByLabelText('Пин код')).not.toBeInTheDocument()
        expect(usernameField).toBeInTheDocument()
        screen.getByText('Введите имя пользователя')
    })

    it.skip('User gets error when incorrect username', async () => {
        const username = 'incorrect'
        fetchMock.mockResponseOnce('"Нет пользователя с таким именем"', {status: 401})

        render(Component, {
            global: {
                plugins: [fakeRouter, store],
            }
        })
        await fakeRouter.isReady()

        const usernameField = screen.getByLabelText("Имя пользователя")

        userEvent.type(usernameField, username)
        await userEvent.click(screen.getByText('Запросить пин'))
        await screen.findByText('Нет пользователя с таким именем')
        expect(screen.queryByLabelText('Пин код')).not.toBeInTheDocument()
        expect(usernameField).toBeInTheDocument()
    })

    it('User logs with correct username and pin', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({}));
        fetchMock.mockResponseOnce(JSON.stringify({token: "123"}));

        render(Component, {
            global: {
                plugins: [fakeRouter, store],
            }
        })
        await fakeRouter.isReady()

        await screen.findByLabelText("Имя пользователя")
        userEvent.type(screen.getByLabelText("Имя пользователя"), 'Pavel')
        await userEvent.click(screen.getByText('Запросить пин'))
        userEvent.type(await screen.findByLabelText('Пин код'), 'test')
        await userEvent.click(screen.getByText('Войти'))
        await fakeRouter.isReady()

        await waitFor(() => {
            expect(fakeRouter.currentRoute.value.name).toEqual('trip-list')
        })
    })

    it('User gets error when trying to login without password', async () => {
        const username = 'Pavel'

        render(Component, {
            global: {
                plugins: [fakeRouter, store],
            }
        })
        await fakeRouter.isReady()

        userEvent.type(await screen.findByLabelText("Имя пользователя"), username)
        await userEvent.click(screen.getByText('Запросить пин'))
        const enterButton = await screen.findByText('Войти')
        await userEvent.click(enterButton)
        expect(enterButton).toBeInTheDocument()
        screen.getByText('Введите пин код')
    })

    it.skip('User gets error when incorrect pin', async () => {
        const username = 'Pavel'
        const pin = 'Incorrect'

        fetchMock.mockResponseOnce(JSON.stringify({}));
        fetchMock.mockResponseOnce('"Нет пользователя с таким пин кодом"', {status: 401})

        render(Component, {
            global: {
                plugins: [fakeRouter, store],
            }
        })
        await fakeRouter.isReady()

        await screen.findByLabelText("Имя пользователя")
        userEvent.type(screen.getByLabelText("Имя пользователя"), username)
        await userEvent.click(screen.getByText('Запросить пин'))
        const pinField = await screen.findByLabelText('Пин код')
        userEvent.type(pinField, pin)
        await userEvent.click(screen.getByText('Войти'))
        await screen.findByText('Нет пользователя с таким пин кодом')
        expect(screen.queryByTestId('navbar')).not.toBeInTheDocument()
        expect(pinField).toBeInTheDocument()
    })

    it('redirects user to the next page if he already logged', async () => {
        store.state.auth.token = 'dummy'
        render(Component, {
            global: {
                plugins: [fakeRouter, store],
            }
        })
        await fakeRouter.isReady()
        expect(fakeRouter.currentRoute.value.name).toEqual('trip-list')
    })
})
