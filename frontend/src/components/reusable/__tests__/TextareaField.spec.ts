import {render, screen} from '@testing-library/vue';
import Component from '../TextareaField.vue';
import userEvent from "@testing-library/user-event";

describe('TextareaField.vue', () => {
    it('renders props.label when passed', async () => {
        const props = {
            modelValue: 'Hello',
            id: 'hello-id',
        }
        const slot = 'Input text here:'

        render(Component, {
            props, slots: {
                default: slot
            }
        })
        expect(screen.getByLabelText(slot)).toBeInTheDocument()

        // Make sure there is no label attached to this input
        const {container} = render(Component, {props})
        expect(container.querySelector('label')).not.toBeInTheDocument()
    })

    it('renders props.value when passed', async () => {
        const props = {
            modelValue: 'Hello',
            id: 'hello-id'
        }

        const {getByDisplayValue, rerender} = render(Component, {props})
        getByDisplayValue(props.modelValue)

        props.modelValue = 'Testing'
        await rerender({modelValue: props.modelValue})
        getByDisplayValue(props.modelValue)
    })

    it('emits update when value changes', async () => {
        const props = {
            modelValue: 'Hello',
            id: 'hello-id',
        }
        const slot = 'Input text here:'

        const {getByLabelText, emitted} = render(Component, {
            props, slots: {
                default: slot
            }
        })
        const usernameInput = getByLabelText(slot)

        const newValue = 'Bob'
        await userEvent.clear(usernameInput)
        await userEvent.type(usernameInput, newValue)
        expect(emitted()).toHaveProperty('update:modelValue')
        expect(emitted()['update:modelValue']).toHaveLength(4)
        expect(emitted()['update:modelValue'][0]).toEqual([""])
        expect(emitted()['update:modelValue'][1]).toEqual(["B"])
        expect(emitted()['update:modelValue'][2]).toEqual(["Bo"])
        expect(emitted()['update:modelValue'][3]).toEqual(["Bob"])
    })

    it('renders props.errors containing vuelidate errors', async () => {
        const props = {
            modelValue: 'Hello',
            id: 'hello-id',
            errors: [
                {
                    $uid: '1',
                    $message: 'Ошибка!'
                },
                {
                    $uid: '2',
                    $message: 'Другая!'
                },
            ]
        }

        render(Component, {props})
        await screen.findByText('Ошибка!')
        await screen.findByText('Другая!')
    })

    it('doesnt emit update event if prop.disabled', async () => {
        const props = {
            modelValue: 'Hello',
            id: 'hello-id',
            disabled: true,
        }
        const slot = 'Input text here:'
        const {emitted} = render(Component, {props, slots: {default: slot}})

        const usernameInput = screen.getByLabelText(slot)
        await userEvent.type(usernameInput, 'should not work')

        expect(emitted()).not.toHaveProperty('update:modelValue')
    })
})
