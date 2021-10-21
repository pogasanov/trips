import {render, screen, waitFor} from '@testing-library/vue';
import store from '@/store';
import Component from '../AdvanceHeaders.vue';
import {ref} from "vue";
import {bootstrapStore} from "@/test-helpers";

describe('AdvanceHeaders.vue', () => {
    beforeEach(() => {
        jest.resetModules()
    })

    it('renders v-model data when passed', async () => {
        fetchMock.mockOnceIf(/\/advance\/purpose/, JSON.stringify([
            {
                uuid: '31',
                name: 'Растраты',
                require_basis: false,
            }, {
                uuid: '32',
                name: 'Поездки',
                require_basis: true,
            }
        ]))
        fetchMock.mockOnceIf(/\/trip\/basis/, JSON.stringify([
            {
                uuid: '41',
                name: 'Приключение',
            }
        ]))

        const props = {
            modelValue: ref({
                organization_uuid: '11',
                employee_uuid: '21',
                purpose_uuid: '31',
                basis_uuid: '41',
            }),
        }

        bootstrapStore()

        const {rerender} = render(Component, {
            props,
            global: {
                plugins: [store],
            }
        })

        expect(await screen.findByLabelText('Организация')).toHaveValue('Microsoft')
        expect(await screen.findByLabelText('Сотрудник')).toHaveValue('Иван')
        await waitFor(() => {
            expect(screen.getByLabelText('Назначение')).toHaveTextContent('Растраты')
            expect(screen.queryByLabelText('Документ основание')).not.toBeInTheDocument()
        })

        props.modelValue.value.purpose_uuid = '32'
        await rerender(props)

        await waitFor(() => {
            expect(screen.getByLabelText('Назначение')).toHaveTextContent('Поездки')
            expect(screen.getByLabelText('Документ основание')).toHaveTextContent('Приключение')
        })
    })

    it.skip('emits update when value changes', async () => {
        // TODO: fix modal field stub

        fetchMock.mockOnceIf(/\/advance\/purpose/, JSON.stringify([
            {
                uuid: '31',
                name: 'Растраты',
                require_basis: false,
            }, {
                uuid: '32',
                name: 'Поездки',
                require_basis: true,
            }
        ]))
        fetchMock.mockOnceIf(/\/trip\/basis/, JSON.stringify([
            {
                uuid: '41',
                name: 'Приключение',
            }
        ]))

        const props = {
            modelValue: {
                organization_uuid: '',
                employee_uuid: '',
                purpose_uuid: '',
                basis_uuid: '',
            },
        }

        const {emitted} = render(Component, {props, global: {plugins: [store]}})

        expect(emitted()).toHaveProperty('update:modelValue')
        expect(emitted()['update:modelValue']).toHaveLength(1)
        expect(emitted()['update:modelValue'][0]).toEqual([{
            organization_uuid: '',
            employee_uuid: '',
            purpose_uuid: '',
            basis_uuid: '',
        }])
    })
})
