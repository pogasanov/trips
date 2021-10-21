import {render, screen} from '@testing-library/vue';
import Component from '../TripRoutes.vue';
import userEvent from "@testing-library/user-event";
import {ref} from "vue";

describe('TripRoutes.vue', () => {
    it('renders v-model data when passed', async () => {
        const props = {
            modelValue: ref([
                {
                    date: '2020-10-20',
                    type: 'Авиа',
                    from: 'Краснодар',
                    to: 'Красноярск'
                }
            ])
        }

        render(Component, {props})
        expect(await screen.findByDisplayValue('2020-10-20')).toBeInTheDocument()
        expect(await screen.findByDisplayValue('Авиа')).toBeInTheDocument()
        expect(await screen.findByDisplayValue('Краснодар')).toBeInTheDocument()
        expect(await screen.findByDisplayValue('Красноярск')).toBeInTheDocument()

        props.modelValue.value = [
            {
                date: '2020-10-20',
                type: 'ЖД',
                from: 'Краснодар',
                to: 'Красноярск'
            }
        ]
        expect(await screen.findByDisplayValue('ЖД')).toBeInTheDocument()
    })

    it('adds new item when add item button is clicked', async () => {
        const props = {
            modelValue: [
                {
                    date: '2020-10-20',
                    type: 'Авто',
                    from: 'Краснодар',
                    to: 'Красноярск'
                }
            ]
        }
        render(Component, {props})

        await userEvent.click(screen.getByText('Добавить строку'))

        const rows = screen.getAllByRole('row')
        expect(rows.length).toEqual(3)
        expect(rows[2].querySelectorAll('input').length).toEqual(3)
    })

    it('emits update when value changes', async () => {
        const props = {
            modelValue: [
                {
                    date: '2020-10-20',
                    type: 'Авто',
                    from: 'Краснодар',
                    to: 'Красноярск'
                }
            ]
        }

        const {emitted} = render(Component, {props})
        const fromField = await screen.findByDisplayValue('Краснодар')
        await userEvent.clear(fromField)
        await userEvent.type(fromField, 'Краснокаменск')

        expect(emitted()).toHaveProperty('update:modelValue')
        expect(emitted()['update:modelValue']).toHaveLength(1)
        expect(emitted()['update:modelValue'][0]).toEqual([
            [
                {
                    date: '2020-10-20',
                    type: 'Авто',
                    from: 'Краснокаменск',
                    to: 'Красноярск'
                }
            ]
        ])
    })

    it('deletes row when row delete button clicked', async () => {
        const props = {
            modelValue: [
                {
                    date: '2020-10-20',
                    type: 'Авто',
                    from: 'Краснодар',
                    to: 'Красноярск'
                }
            ]
        }

        render(Component, {props})

        await userEvent.click(await screen.findByText('-'))

        expect(screen.queryByDisplayValue('2020-10-20')).not.toBeInTheDocument()
        expect(screen.queryByDisplayValue('Авто')).not.toBeInTheDocument()
        expect(screen.queryByDisplayValue('Краснодар')).not.toBeInTheDocument()
        expect(screen.queryByDisplayValue('Красноярск')).not.toBeInTheDocument()
    })
})
