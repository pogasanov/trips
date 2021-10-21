import {render, screen} from '@testing-library/vue';
import Component from '../ModalField.vue';
import userEvent from "@testing-library/user-event";
import DefaultModal from '@/components/modals/DefaultModal.vue';
import {ModalsContainer} from 'vue-final-modal';

describe('ModalField.vue', () => {
    it('renders props.label when passed', async () => {
        const props = {
            modelValue: 'Hello',
            id: 'hello-id',
            items: [],
        }
        const slot = 'Click me'

        render(Component, {
            props, slots: {
                default: slot
            },
        })
        expect(screen.getByLabelText(slot)).toBeInTheDocument()

        // Make sure there is no label attached to this input
        const {container} = render(Component, {
            props,
        })
        expect(container.querySelector('label')).not.toBeInTheDocument()
    })

    it('renders props.errors containing vuelidate errors', async () => {
        const props = {
            modelValue: 'Hello',
            id: 'hello-id',
            items: [],
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

        render(Component, {
            props,
        })
        await screen.findByText('Ошибка!')
        await screen.findByText('Другая!')
    })

    it('shows modal window when clicked', async () => {
        const ParentComponent = {
            template: "<div>" +
                "<modal-field id='hello-id' title='Im open!' :items='[]'>" +
                "Click me" +
                "</modal-field>" +
                "<modals-container></modals-container>" +
                "</div>"
        }

        render(ParentComponent, {
            global: {
                components: {
                    ModalField: Component,
                    DefaultModal: DefaultModal,
                    ModalsContainer: ModalsContainer,
                },
            }
        })

        userEvent.click(await screen.getByLabelText('Click me'))
        expect(await screen.findByText("Im open!")).toBeInTheDocument()
    })
})
