import {render, screen} from '@testing-library/vue';
import Component from '../DefaultModal.vue';
import userEvent from "@testing-library/user-event";

describe('DefaultModal.vue', () => {
    it('filter items', async () => {
        render(Component, {
            props: {
                items: [{
                    uuid: '1',
                    name: 'First item'
                }, {
                    uuid: '2',
                    name: 'Second item'
                }]
            }
        })

        await userEvent.type(screen.getByRole('searchbox', {hidden: true}), 'first')
        expect(screen.getByText('First item')).toBeInTheDocument()
        expect(screen.queryByText('Second item')).not.toBeInTheDocument()
    })
})
