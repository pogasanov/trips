import {render, screen, waitFor} from '@testing-library/vue';
import Component from '../AdvanceEditor.vue';
import userEvent from "@testing-library/user-event";
import {actAsLoggedUser, bootstrapStore, advanceShowPayload} from "@/test-helpers";
import {createRouter, createWebHistory} from "vue-router";
import store from '@/store';
import router from '@/router';

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
            path: '/advance-list',
            name: 'advance-list',
            component: {
                template: ''
            }
        },
        {
            path: '/advance-draft',
            name: 'advance-drafts',
            component: {
                template: ''
            }
        },
    ]
})

describe('AdvanceEditor.vue', () => {
    const renderComponent = (props = {}) => {
        return render(Component, {
            props,
            global: {
                plugins: [router, store],
                stubs: {
                    AdvanceHeaders: true,
                    ModalButton: true,
                }
            },
        })
    }

    beforeEach(async () => {
        fetchMock.resetMocks();
        jest.resetModules();
        bootstrapStore()
        actAsLoggedUser()
    });

    it('opens advance list when close button is clicked', async () => {
        renderComponent()

        userEvent.click(await screen.getByText('Закрыть без сохранения'))
        await router.isReady()

        expect(router.currentRoute.value.name).toEqual('advance-list')
    })

    it('creates advance when save button is clicked and uuid is not provided', async () => {
        fetchMock.mockResponseOnce('');

        renderComponent()

        userEvent.click(await screen.getByText('Отправить на согласование'))
        await router.isReady()

        expect(fetchMock).toBeCalledTimes(1)
        expect((fetchMock.mock.calls[0][0] as string)?.endsWith('/advance')).toBeTruthy()
        expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string).is_draft).toEqual("0")

        expect(router.currentRoute.value.name).toEqual('advance-list')
    })

    it('creates advance draft when save draft button is clicked and uuid is not provided', async () => {
        fetchMock.mockResponseOnce('');

        renderComponent()

        userEvent.click(await screen.findByText('Сохранить черновик'))
        await router.isReady()

        expect(fetchMock).toBeCalledTimes(1)
        expect((fetchMock.mock.calls[0][0] as string)?.endsWith('/advance')).toBeTruthy()
        expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string).is_draft).toEqual("1")

        expect(router.currentRoute.value.name).toEqual('advance-drafts')
    })

    it('saves advance when save button is clicked and uuid is provided', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(advanceShowPayload));
        fetchMock.mockResponseOnce('');

        renderComponent({
            uuid: '1',
        })

        userEvent.click(await screen.getByText('Отправить на согласование'))
        await router.isReady()

        expect(fetchMock).toBeCalledTimes(2)
        expect(fetchMock.mock.calls[1][0]).toContain('/advance/1')
        expect(JSON.parse(fetchMock.mock.calls[1][1]?.body as string).is_draft).toEqual("0")

        expect(router.currentRoute.value.name).toEqual('advance-list')
    })

    it('saves draft advance when save draft button is clicked and uuid is provided', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({
            ...advanceShowPayload,
            is_draft: true,
        }));
        fetchMock.mockResponseOnce('');

        renderComponent({
            uuid: '1',
        })

        userEvent.click(await screen.findByText('Сохранить черновик'))
        await router.isReady()

        expect(fetchMock).toBeCalledTimes(2)
        expect(fetchMock.mock.calls[1][0]).toContain('/advance/1')
        expect(JSON.parse(fetchMock.mock.calls[1][1]?.body as string).is_draft).toEqual("1")

        expect(router.currentRoute.value.name).toEqual('advance-drafts')
    })

    it('doesnt show save draft button if document exists and is not draft', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({
            ...advanceShowPayload,
            is_draft: false,
        }));

        renderComponent({
            uuid: '1',
        })
        await router.isReady()

        expect(screen.queryByText('Сохранить черновик')).not.toBeInTheDocument()
    })

    it('show save draft button if document exists and is draft', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({
            ...advanceShowPayload,
            is_draft: true,
        }));

        renderComponent({
            uuid: '1',
        })
        await router.isReady()

        expect(screen.getByText('Сохранить черновик')).toBeInTheDocument()
    })

    it.skip('gets data when props.uuid is provided', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(advanceShowPayload));

        bootstrapStore()

        render(Component, {
            props: {uuid: '1'},
            global: {
                plugins: [fakeRouter, store]
            }
        })

        await waitFor(() => {
            expect(screen.getByLabelText('Организация')).toHaveValue('Apple')
            expect(screen.getByLabelText('Сотрудник')).toHaveValue('Петя')
        })
    })

    it.skip('gets organization and employee when props.uuid is not provided', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(advanceShowPayload));

        bootstrapStore()

        render(Component, {
            global: {
                plugins: [fakeRouter, store]
            }
        })

        await waitFor(() => {
            expect(screen.getByLabelText('Организация')).toHaveValue('Microsoft')
            expect(screen.getByLabelText('Сотрудник')).toHaveValue('Иван')
        })
    })

    it.skip('get validation errors when trying to save without filling', async () => {
        render(Component, {
            global: {
                plugins: [fakeRouter, store],
            }
        })
        await fakeRouter.isReady()

        userEvent.click(await screen.getByText('Отправить на согласование'))
        expect(await screen.findByText('Введите Вид документа')).toBeInTheDocument()
        expect(await screen.findByText('Введите Место назначения (организация)')).toBeInTheDocument()
        expect(await screen.findByText('Введите Место назначения (страна, город)')).toBeInTheDocument()
        expect(await screen.findByText('Введите Служебное поручение (цель)')).toBeInTheDocument()
        expect(await screen.findByText('Введите Дата начала командировки')).toBeInTheDocument()
        expect(await screen.findByText('Введите Дата окончания командировки')).toBeInTheDocument()
        expect(await screen.findByText('Введите Вид суточной ставки')).toBeInTheDocument()

        userEvent.selectOptions(screen.getByLabelText('Вид документа'), 'Изменение условий командировки')
        userEvent.click(await screen.getByText('Отправить на согласование'))
        expect(await screen.queryByText('Введите Вид документа')).not.toBeInTheDocument()
        expect(await screen.findByText('Введите Документ основание')).toBeInTheDocument()

        userEvent.click(await screen.getByText('Маршрут'))
        userEvent.click(await screen.getByText('Добавить новый маршрут'))
        userEvent.click(await screen.getByText('Отправить на согласование'))

        expect(await screen.findByText('Введите дату')).toBeInTheDocument()
        expect(await screen.findByText('Введите вид транспорта')).toBeInTheDocument()
        expect(await screen.findByText('Введите откуда (город)')).toBeInTheDocument()
        expect(await screen.findByText('Введите куда (город)')).toBeInTheDocument()
    })

    it.skip('updates data from another trip when basis_uuid is set', async () => {
        // TODO: have no clue how to do this test at this moment
    })
})
