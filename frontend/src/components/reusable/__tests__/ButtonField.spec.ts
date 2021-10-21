import {render, screen} from '@testing-library/vue';
import Component from '../ButtonField.vue';
import userEvent from "@testing-library/user-event";

describe('ButtonField.vue', () => {
    it('renders props.label when passed', async () => {
        render(Component, {
            slots: {
                default: ['Click me']
            }
        })

        const button = screen.getByRole('button')
        expect(button).toHaveTextContent('Click me')
    })

    it('emits click event when clicked', async () => {
        const {emitted} = render(Component)

        userEvent.click(screen.getByRole('button'))
        expect(emitted()).toHaveProperty('click')
        expect(emitted()['click']).toHaveLength(1)
    })

    it('doesnt emit click event if prop.disabled', async () => {
        const {emitted} = render(Component, {
            props: {
                disabled: true
            }
        })

        userEvent.click(screen.getByRole('button'))
        expect(emitted()).not.toHaveProperty('click')
    })

    it('renders default class if no class is provided', async () => {
        const {unmount} = render(Component)

        let button = screen.getByRole('button')
        expect(button).toHaveClass('px-2')
        expect(button).toHaveClass('py-2')

        unmount()
        render(Component, {
            props: {
                class: 'test'
            }
        })

        button = screen.getByRole('button')
        expect(button).toHaveClass('test')
        expect(button).not.toHaveClass('px-2')
        expect(button).not.toHaveClass('py-2')
    })
})
