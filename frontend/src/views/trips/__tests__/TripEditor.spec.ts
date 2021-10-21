import {render, screen, waitFor} from '@testing-library/vue';
import Component from '../TripEditor.vue';
import userEvent from "@testing-library/user-event";
import {actAsLoggedUser, bootstrapStore, tripShowPayload} from "@/test-helpers";
import {createMemoryHistory, createRouter, Router} from "vue-router";
import store from '@/store';

const fillHeaderValues = async () => {
    userEvent.selectOptions(screen.getByLabelText('Вид документа'), 'Заявка на командировку')
    userEvent.type(screen.getByLabelText('Место назначения (организация)'), 'Apple')
    userEvent.type(screen.getByLabelText('Место назначения (страна, город)'), 'Краснокаменск')
    userEvent.type(screen.getByLabelText('Служебное поручение (цель)'), 'Приключения')
    userEvent.type(screen.getByLabelText('Дата начала командировки'), '2020-10-20')
    userEvent.type(screen.getByLabelText('Дата окончания командировки'), '2020-10-23')
    userEvent.selectOptions(screen.getByLabelText('Вид суточной ставки'), '2 per diem (2)')
}

describe('TripEditor.vue', () => {
    let fakeRouter: Router

    beforeEach(async () => {
        fetchMock.resetMocks();
        jest.resetModules();
        actAsLoggedUser()
        bootstrapStore()
        fetchMock.mockOnceIf(/\/trip\/basis$/, JSON.stringify([
            {
                uuid: '10',
                name: 'Приключение'
            }
        ]))
        fakeRouter = createRouter({
            history: createMemoryHistory(),
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
                {
                    path: '/trip-draft',
                    name: 'trip-drafts',
                    component: {
                        template: ''
                    }
                },
            ]
        })

    });

    it('opens trips list when close button is clicked', async () => {
        render(Component, {
            global: {
                plugins: [fakeRouter, store]
            }
        })

        userEvent.click(await screen.getByText('Закрыть без сохранения'))
        await fakeRouter.isReady()

        expect(fakeRouter.currentRoute.value.name).toEqual('trip-list')
    })

    it('creates trip when save button is clicked and uuid is not provided', async () => {
        fetchMock.mockResponseOnce('');

        render(Component, {
            global: {
                plugins: [fakeRouter, store]
            }
        })

        await fillHeaderValues()
        userEvent.click(await screen.getByText('Отправить на согласование'))
        await fakeRouter.isReady()

        expect(fetchMock).toBeCalled()
        expect((fetchMock.mock.calls[1][0] as string)?.endsWith('/trip')).toBeTruthy()
        expect(JSON.parse(fetchMock.mock.calls[1][1]?.body as string).is_draft).toEqual("0")

        expect(fakeRouter.currentRoute.value.name).toEqual('trip-list')
    })

    it('creates trip draft when save draft button is clicked and uuid is not provided', async () => {
        fetchMock.mockResponseOnce('');

        render(Component, {
            global: {
                plugins: [fakeRouter, store]
            }
        })

        await fillHeaderValues()
        userEvent.click(await screen.findByText('Сохранить черновик'))
        await fakeRouter.isReady()

        expect(fetchMock).toBeCalled()
        expect((fetchMock.mock.calls[1][0] as string)?.endsWith('/trip')).toBeTruthy()
        expect(JSON.parse(fetchMock.mock.calls[1][1]?.body as string).is_draft).toEqual("1")

        expect(fakeRouter.currentRoute.value.name).toEqual('trip-drafts')
    })

    it('saves trip when save button is clicked and uuid is provided', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(tripShowPayload));
        fetchMock.mockResponseOnce('');

        render(Component, {
            props: {
                uuid: '1',
            },
            global: {
                plugins: [fakeRouter, store]
            }
        })

        await fillHeaderValues()
        userEvent.click(await screen.getByText('Отправить на согласование'))
        await fakeRouter.isReady()

        expect(fetchMock).toBeCalledTimes(3)
        expect(fetchMock.mock.calls[2][0]).toContain('/trip/1')
        expect(JSON.parse(fetchMock.mock.calls[2][1]?.body as string).is_draft).toEqual("0")

        expect(fakeRouter.currentRoute.value.name).toEqual('trip-list')
    })

    it('doesnt save trip if editable is false', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(tripShowPayload));

        render(Component, {
            props: {
                uuid: '1',
                editable: false,
            },
            global: {
                plugins: [fakeRouter, store]
            }
        })
        await fakeRouter.isReady()

        userEvent.click(await screen.getByText('Отправить на согласование'))

        expect(fetchMock).toBeCalledTimes(2)
        expect(fakeRouter.currentRoute.value.name).toEqual('original')
    })

    it('saves draft trip when save draft button is clicked and uuid is provided', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(tripShowPayload));
        fetchMock.mockResponseOnce('');

        render(Component, {
            props: {
                uuid: '1',
            },
            global: {
                plugins: [fakeRouter, store]
            }
        })

        const saveDraftButton = await screen.findByText('Сохранить черновик')
        await fillHeaderValues()
        userEvent.click(saveDraftButton)
        await fakeRouter.isReady()

        expect(fetchMock).toBeCalledTimes(3)
        expect(fetchMock.mock.calls[2][0]).toContain('/trip/1')
        expect(JSON.parse(fetchMock.mock.calls[2][1]?.body as string).is_draft).toEqual("1")

        expect(fakeRouter.currentRoute.value.name).toEqual('trip-drafts')
    })

    it('doesnt save draft if editable is false', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(tripShowPayload));

        render(Component, {
            props: {
                uuid: '1',
                editable: false,
            },
            global: {
                plugins: [fakeRouter, store]
            }
        })
        await fakeRouter.isReady()

        userEvent.click(await screen.findByText('Сохранить черновик'))

        expect(fetchMock).toBeCalledTimes(2)
        expect(fakeRouter.currentRoute.value.name).toEqual('original')
    })

    it('gets data when props.uuid is provided', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(tripShowPayload));

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

    it('gets organization and employee when props.uuid is not provided', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(tripShowPayload));

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

    it('get validation errors when trying to save without filling', async () => {
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
        expect(await screen.findByText('Выберите Вид суточной ставки')).toBeInTheDocument()

        userEvent.selectOptions(screen.getByLabelText('Вид документа'), 'Изменение условий командировки')
        userEvent.click(await screen.getByText('Отправить на согласование'))
        expect(await screen.queryByText('Введите Вид документа')).not.toBeInTheDocument()
        expect(await screen.findByText('Введите Документ основание')).toBeInTheDocument()

        userEvent.click(await screen.getByText('Маршрут'))
        userEvent.click(await screen.getByText('Добавить строку'))
        userEvent.click(await screen.getByText('Отправить на согласование'))

        expect(await screen.findByText('Введите дату')).toBeInTheDocument()
        expect(await screen.findByText('Введите вид транспорта')).toBeInTheDocument()
        expect(await screen.findByText('Введите откуда (город)')).toBeInTheDocument()
        expect(await screen.findByText('Введите куда (город)')).toBeInTheDocument()
    })

    it('doesnt show save draft button if document exists and is not draft', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({
            ...tripShowPayload,
            is_draft: false,
        }));

        render(Component, {
            props: {uuid: '1'},
            global: {
                plugins: [fakeRouter, store],
            }
        })
        await fakeRouter.isReady()

        expect(screen.queryByText('Сохранить черновик')).not.toBeInTheDocument()
    })

    it('show save draft button if document exists and is draft', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({
            ...tripShowPayload,
            is_draft: true,
        }));

        render(Component, {
            global: {
                plugins: [fakeRouter, store],
            }
        })
        await fakeRouter.isReady()

        expect(screen.getByText('Сохранить черновик')).toBeInTheDocument()
    })

    it.skip('updates data from another trip when basis_uuid is set', async () => {
        // TODO: have no clue how to do this test at this moment
    })
})
