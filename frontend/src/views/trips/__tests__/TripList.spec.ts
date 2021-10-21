import {render, screen, waitFor, waitForElementToBeRemoved} from '@testing-library/vue';
import Component from '../TripList.vue';
import userEvent from "@testing-library/user-event";
import {actAsLoggedUser, advanceShowPayload} from "@/test-helpers";
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
            path: '/trip/:uuid/edit',
            name: 'trip-edit',
            component: {
                template: ''
            }
        },
        {
            path: '/trip/:uuid',
            name: 'trip-show',
            component: {
                template: ''
            }
        },
    ]
})

describe('TripList.vue', () => {
    const mockListResponse = () => {
        fetchMock.mockResponseOnce(JSON.stringify([
            {
                uuid: '1',
                number: '1',
                date: '2020-01-01',
                name: 'Название',
                status: 'Согласован',
                condition: 'Согласован',
                type: 'Заявка на командировку'
            },
            {
                uuid: '2',
                number: '2',
                date: '2021-10-20',
                name: 'Другой документ',
                status: 'В процессе',
                condition: 'В процессе',
                type: 'Изменение условий командировки'
            },
        ]));
    }

    beforeEach(async () => {
        fetchMock.resetMocks();
        jest.resetModules();
        actAsLoggedUser()
    });

    it('User sees list of trips', async () => {
        mockListResponse()

        render(Component, {
            global: {
                plugins: [fakeRouter]
            }
        })
        await fakeRouter.isReady()

        await screen.findByText("Название")
        await screen.findByText("Другой документ")
    })

    it('opens trip editor if view button is clicked', async () => {
        mockListResponse()
        fetchMock.mockResponseOnce(JSON.stringify(advanceShowPayload))

        render(Component, {
            global: {
                plugins: [fakeRouter]
            }
        })
        await fakeRouter.isReady()

        userEvent.click((await screen.findAllByText('Просмотр'))[1])

        await waitFor(() => {
            expect(fakeRouter.currentRoute.value.name).toEqual('trip-show')
            expect(fakeRouter.currentRoute.value.params.uuid).toEqual('2')
        })
    })

    it('sends delete if delete button is clicked', async () => {
        mockListResponse()
        fetchMock.mockResponseOnce(JSON.stringify({}))
        fetchMock.mockResponseOnce(JSON.stringify([
            {
                uuid: '1',
                number: '1',
                date: '2020-01-01',
                name: 'Название',
                status: 'Согласован',
                condition: 'Согласован',
                type: 'Заявка на командировку'
            },
        ]));

        render(Component, {
            global: {
                plugins: [fakeRouter]
            }
        })
        await fakeRouter.isReady()

        const deleteButton = (await screen.findAllByText('Удалить'))[1]

        await userEvent.click(deleteButton)
        await waitForElementToBeRemoved(deleteButton)

        expect(fetchMock).toBeCalledTimes(3)
        expect(fetchMock.mock.calls[1][0]).toContain('/trip/2')
        expect(fetchMock.mock.calls[1][1]?.method).toEqual('DELETE')
    })

    it('sends file if add file button is clicked', async () => {
        mockListResponse()
        fetchMock.mockResponseOnce(JSON.stringify({}))

        const file = new File(['hello'], 'hello.png', {type: 'image/png'})
        window.FileReader = jest.fn().mockImplementation(() => {
            return {
                readAsDataURL: function () {
                    this.onloadend()
                },
                result: 'hello'
            }
        }) as unknown as jest.MockedClass<typeof FileReader>;

        render(Component, {
            global: {
                plugins: [fakeRouter]
            }
        })
        await fakeRouter.isReady()

        const addFileButton = (await screen.findAllByText('Добавить файл'))[1]

        await userEvent.upload(addFileButton, file)

        expect(fetchMock).toBeCalledTimes(2)
    })
})
