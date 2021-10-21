import {render, screen, waitForElementToBeRemoved} from '@testing-library/vue';
import router from '@/router';
import Component from '../AdvanceDrafts.vue';
import userEvent from "@testing-library/user-event";
import {actAsLoggedUser} from "@/test-helpers";

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

describe('AdvanceDrafts.vue', () => {
    const mockListResponse = () => {
        fetchMock.mockResponseOnce(JSON.stringify(listResponse));
    }

    beforeEach(async () => {
        fetchMock.resetMocks();
        jest.resetModules();
        actAsLoggedUser()
    });

    it('User sees list of advances', async () => {
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
                total_price: 123.45
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
        expect(fetchMock.mock.calls[1][0]).toContain('/advance/2')
        expect(fetchMock.mock.calls[1][1]?.method).toEqual('DELETE')
    })
})
