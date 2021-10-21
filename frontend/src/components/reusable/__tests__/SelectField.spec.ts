import {render, screen} from '@testing-library/vue';
import Component from '../SelectField.vue';
import userEvent from "@testing-library/user-event";

describe('SelectField.vue', () => {
    it('renders props.label when passed', async () => {
        const props = {
            modelValue: 'Hello',
            id: 'hello-id',
            options: [{uuid: 'Hello', name: 'Hello'}],
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

    it('renders props.options when passed', async () => {
        const props = {
            modelValue: 'Hello',
            id: 'hello-id',
            options: [
                {
                    uuid: 'why_uuid',
                    name: 'Why',
                },
                {
                    uuid: 'not_uuid',
                    name: 'Not',
                },
                {
                    uuid: 'hello_uuid',
                    name: 'Hello',
                },
            ]
        }
        const slot = 'Input text here:'

        const {getAllByRole} = render(Component, {
            props, slots: {
                default: slot
            }
        })

        const options = getAllByRole('option')
        expect(options.length).toEqual(props.options.length + 1)
        expect(options[0]).toHaveTextContent('Выберите значение из списка')
        expect(options[1]).toHaveTextContent(props.options[0].name)
    })

    it('renders props.value when passed', async () => {
        const props = {
            modelValue: '',
            id: 'hello-id',
            options: [
                {
                    uuid: 'why_uuid',
                    name: 'Why',
                },
                {
                    uuid: 'not_uuid',
                    name: 'Not',
                },
                {
                    uuid: 'hello_uuid',
                    name: 'Hello',
                },
            ]
        }
        const slot = 'Input text here:'

        const {getByDisplayValue, rerender} = render(Component, {
            props, slots: {
                default: slot
            }
        })
        getByDisplayValue('Выберите значение из списка')

        props.modelValue = 'not_uuid'
        await rerender({modelValue: props.modelValue})
        getByDisplayValue('Not')
    })

    it('emits update when value changes', async () => {
        const props = {
            modelValue: 'Why',
            id: 'hello-id',
            options: [
                {
                    uuid: 'why_uuid',
                    name: 'Why',
                },
                {
                    uuid: 'not_uuid',
                    name: 'Not',
                },
                {
                    uuid: 'hello_uuid',
                    name: 'Hello',
                },
            ]
        }
        const slot = 'Input text here:'

        const {getByLabelText, emitted} = render(Component, {
            props, slots: {
                default: slot
            }
        })
        const usernameInput = getByLabelText(slot)

        userEvent.selectOptions(usernameInput, 'Not')

        expect(emitted()).toHaveProperty('update:modelValue')
        expect(emitted()['update:modelValue']).toHaveLength(1)
        expect(emitted()['update:modelValue'][0]).toEqual(['not_uuid'])
    })

    it('renders props.errors containing vuelidate errors', async () => {
        const props = {
            modelValue: 'Why',
            id: 'hello-id',
            options: [
                {
                    uuid: 'why_uuid',
                    name: 'Why',
                },
                {
                    uuid: 'not_uuid',
                    name: 'Not',
                },
                {
                    uuid: 'hello_uuid',
                    name: 'Hello',
                },
            ],
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
            modelValue: 'Why',
            id: 'hello-id',
            disabled: true,
            options: [
                {
                    uuid: 'why_uuid',
                    name: 'Why',
                },
                {
                    uuid: 'not_uuid',
                    name: 'Not',
                },
                {
                    uuid: 'hello_uuid',
                    name: 'Hello',
                },
            ]
        }
        const slot = 'Input text here:'
        const {getByLabelText, emitted} = render(Component, {
            props, slots: {
                default: slot
            }
        })
        const usernameInput = getByLabelText(slot)

        userEvent.selectOptions(usernameInput, 'Not')

        expect(emitted()).not.toHaveProperty('update:modelValue')
    })
})