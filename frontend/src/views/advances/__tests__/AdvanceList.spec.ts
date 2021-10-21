import {render, screen, waitFor, waitForElementToBeRemoved} from '@testing-library/vue';
import Component from '../AdvanceList.vue';
import userEvent from "@testing-library/user-event";
import {actAsLoggedUser, mockFileReader} from "@/test-helpers";
import router from '@/router';


const listResponse = [
    {
        uuid: '1',
        number: '1',
        date: '2020-01-01',
        name: 'Название',
        status: 'Согласован',
        condition: 'Согласован',
        total_price: 123.45
    },
    {
        uuid: '2',
        number: '2',
        date: '2021-10-20',
        name: 'Другой документ',
        status: 'В процессе',
        condition: 'В процессе',
        total_price: 567.89
    },
];

describe('AdvanceList.vue', () => {
    beforeEach(async () => {
        fetchMock.resetMocks();
        jest.resetModules();
        actAsLoggedUser()
    });

    it('User sees list of advances', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(listResponse))

        render(Component, {
            global: {
                plugins: [router]
            }
        })
        await router.isReady()

        await screen.findByText("Название")
        await screen.findByText("Другой документ")
    })

    it('opens advance editor if view button is clicked', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(listResponse))

        render(Component, {
            global: {
                plugins: [router]
            }
        })
        await router.isReady()

        userEvent.click((await screen.findAllByText('Просмотр'))[1])

        await waitFor(() => {
            expect(router.currentRoute.value.name).toEqual('advance-show')
            expect(router.currentRoute.value.params.uuid).toEqual('2')
        })
    })

    it('sends delete if delete button is clicked', async () => {
        // Initial load
        fetchMock.mockResponseOnce(JSON.stringify(listResponse))
        // Delete response
        fetchMock.mockResponseOnce(JSON.stringify({}))
        // List reload
        fetchMock.mockResponseOnce(JSON.stringify([listResponse[0]]));

        render(Component, {
            global: {
                plugins: [router]
            }
        })
        await router.isReady()

        const deleteButton = (await screen.findAllByText('Удалить'))[1]

        await userEvent.click(deleteButton)
        await waitForElementToBeRemoved(deleteButton)

        expect(fetchMock).toBeCalledTimes(3)
        expect(fetchMock.mock.calls[1][0]).toContain('/advance/2')
        expect(fetchMock.mock.calls[1][1]?.method).toEqual('DELETE')
    })

    it('sends file if add file button is clicked', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(listResponse))
        fetchMock.mockResponseOnce(JSON.stringify({}))

        const file = new File(['hello'], 'hello.png', {type: 'image/png'})
        mockFileReader('hello')

        render(Component, {
            global: {
                plugins: [router]
            }
        })
        await router.isReady()

        const addFileButton = (await screen.findAllByText('Добавить файл'))[1]

        await userEvent.upload(addFileButton, file)

        expect(fetchMock).toBeCalledTimes(2)
    })
})
