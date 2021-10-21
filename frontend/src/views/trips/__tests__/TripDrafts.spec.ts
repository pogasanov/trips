import {render, screen, waitForElementToBeRemoved} from '@testing-library/vue';
import router from '@/router';
import Component from '../TripDrafts.vue';
import userEvent from "@testing-library/user-event";
import {actAsLoggedUser} from "@/test-helpers";

describe('TripDrafts.vue', () => {
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
                plugins: [router]
            }
        })

        await router.isReady()

        await screen.findByText("Название")
        await screen.findByText("Другой документ")
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
                plugins: [router]
            }
        })
        await router.isReady()

        const deleteButton = (await screen.findAllByText('Удалить'))[1]

        await userEvent.click(deleteButton)
        await waitForElementToBeRemoved(deleteButton)

        expect(fetchMock).toBeCalledTimes(3)
        expect(fetchMock.mock.calls[1][0]).toContain('/trip/2')
        expect(fetchMock.mock.calls[1][1]?.method).toEqual('DELETE')
    })
})
