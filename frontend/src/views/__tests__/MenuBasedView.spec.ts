import {render, screen, waitFor} from '@testing-library/vue';
import Component from '../MenuBasedView.vue';
import userEvent from "@testing-library/user-event";
import {createRouter, createWebHistory} from "vue-router";
import store from '@/store';
import {actAsLoggedUser, bootstrapStore} from "@/test-helpers";

const fakeRouter = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'original',
            component: {
                template: '<div>Original page</div>'
            }
        },
        {
            path: '/trip-list',
            name: 'trip-list',
            component: {
                template: '<div>Trip list page</div>'
            }
        },
        {
            path: '/trip-create',
            name: 'trip-create',
            component: {
                template: '<div>Trip create page</div>'
            }
        },
        {
            path: '/trip-drafts',
            name: 'trip-drafts',
            component: {
                template: '<div>Trip drafts page</div>'
            }
        },
        {
            path: '/advance-list',
            name: 'advance-list',
            component: {
                template: '<div>Advance list page</div>'
            }
        },
        {
            path: '/advance-create',
            name: 'advance-create',
            component: {
                template: '<div>Advance create page</div>'
            }
        },
        {
            path: '/advance-drafts',
            name: 'advance-drafts',
            component: {
                template: '<div>Advance drafts page</div>'
            }
        },
    ]
})

describe('MenuBasedView.vue', () => {
    beforeEach(async () => {
        fetchMock.resetMocks();
        jest.resetModules();
        // Bootstrap mock
        fetchMock.mockResponseOnce(JSON.stringify({user: {name: 'Dummy'}}));
        actAsLoggedUser();
        bootstrapStore();
    });

    it('toggles sidebar using button click', async () => {
        // This is simple test to check if width is big/small by checking if it has class
        // Unfortunately, jsdom doesn't support measurements
        render(Component, {
            global: {
                plugins: [fakeRouter, store]
            }
        })
        await fakeRouter.isReady()

        const navbar = screen.getByTestId('navbar')
        const toggleButton = screen.getByLabelText('toggle sidebar')

        expect(navbar).toHaveClass('w-navbar')
        await userEvent.click(toggleButton)
        expect(navbar).not.toHaveClass('w-navbar')
        await userEvent.click(toggleButton)
        expect(navbar).toHaveClass('w-navbar')
    })

    it('shows current user name', async () => {
        render(Component, {
            global: {
                plugins: [fakeRouter, store]
            }
        })
        await fakeRouter.isReady()

        expect(screen.getByText('Текущий пользователь: Dummy')).toBeInTheDocument()
    })

    it('log user out', async () => {
        Object.defineProperty(window, 'location', {
            value: { reload: jest.fn() }
        })
        render(Component, {
            global: {
                plugins: [fakeRouter, store]
            }
        })
        await fakeRouter.isReady()

        expect(store.getters['auth/isAuthenticated']).toBeTruthy()
        userEvent.click(screen.getByRole('button', {name: 'Выйти'}))
        expect(store.getters['auth/isAuthenticated']).toBeFalsy()
    })

    it('opens trip list if trip list button is clicked', async () => {
        render(Component, {
            global: {
                plugins: [fakeRouter, store]
            }
        })
        await fakeRouter.isReady()

        userEvent.click(await screen.getByText('Список отправленных заявок на командировку/изменений условий командировки'))
        await waitFor(() => {
            expect(fakeRouter.currentRoute.value.name).toEqual('trip-list')
        })
    })

    it('opens trip editor if create new trip item button is clicked', async () => {
        render(Component, {
            global: {
                plugins: [fakeRouter, store]
            }
        })
        await fakeRouter.isReady()

        userEvent.click(await screen.getByText('Создать заявку на командировку/изменения условий командировки'))

        await waitFor(() => {
            expect(fakeRouter.currentRoute.value.name).toEqual('trip-create')
            expect(fakeRouter.currentRoute.value.params.uuid).toBeUndefined()
        })
    })

    it('opens trip drafts if trip drafts button is clicked', async () => {
        render(Component, {
            global: {
                plugins: [fakeRouter, store]
            }
        })
        await fakeRouter.isReady()

        userEvent.click(await screen.getByText('Черновики заявок на командировку/изменений условий командировки'))

        await waitFor(() => {
            expect(fakeRouter.currentRoute.value.name).toEqual('trip-drafts')
        })
    })

    it('opens advance list if advance list button is clicked', async () => {
        render(Component, {
            global: {
                plugins: [fakeRouter, store]
            }
        })
        await fakeRouter.isReady()

        userEvent.click(await screen.getByText('Список отправленных авансовых отчетов'))
        await waitFor(() => {
            expect(fakeRouter.currentRoute.value.name).toEqual('advance-list')
        })
    })

    it('opens advance editor if create new advance item button is clicked', async () => {
        render(Component, {
            global: {
                plugins: [fakeRouter, store]
            }
        })
        await fakeRouter.isReady()

        userEvent.click(await screen.getByText('Создать авансовый отчет'))

        await waitFor(() => {
            expect(fakeRouter.currentRoute.value.name).toEqual('advance-create')
            expect(fakeRouter.currentRoute.value.params.uuid).toBeUndefined()
        })
    })

    it('opens advance drafts if advance drafts button is clicked', async () => {
        render(Component, {
            global: {
                plugins: [fakeRouter, store]
            }
        })
        await fakeRouter.isReady()

        userEvent.click(await screen.getByText('Черновики авансовых отчетов'))

        await waitFor(() => {
            expect(fakeRouter.currentRoute.value.name).toEqual('advance-drafts')
        })
    })
})
