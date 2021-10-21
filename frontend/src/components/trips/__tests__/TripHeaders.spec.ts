import {render, screen} from '@testing-library/vue';
import store from '@/store';
import Component from '../TripHeaders.vue';
import userEvent from "@testing-library/user-event";
import {ref} from "vue";
import {bootstrapStore} from "@/test-helpers";

describe('TripHeaders.vue', () => {
    beforeEach(() => {
        jest.resetModules()

        fetchMock.mockOnceIf(/\/trip\/basis$/, JSON.stringify([
            {
                uuid: '10',
                name: 'Приключение'
            }
        ]))
    })

    it('renders v-model data when passed', async () => {
        const props = {
            modelValue: ref({
                type: 'Заявка на командировку',
                basis_uuid: '10',
                organization_uuid: '11',
                employee_uuid: '21',
                destination_organization: '3',
                destination_city: '4',
                errand: '5',
                date_start: '2020-01-14',
                date_end: '2020-02-17',
                price_tickets: 6,
                price_living: 7,
                per_diem_rate_uuid: '41',
                smartway_codes_count: 9,
            }),
        }
        bootstrapStore()

        const {rerender} = render(Component, {
            props, global: {
                plugins: [store]
            }
        })

        expect(await screen.findByLabelText('Вид документа')).toHaveValue('Заявка на командировку')
        expect(await screen.queryByLabelText('Документ основание')).not.toBeInTheDocument()
        expect(await screen.findByLabelText('Организация')).toHaveValue('Microsoft')
        expect(await screen.findByLabelText('Сотрудник')).toHaveValue('Иван')
        expect(await screen.findByLabelText('Место назначения (организация)')).toHaveValue(props.modelValue.value.destination_organization)
        expect(await screen.findByLabelText('Место назначения (страна, город)')).toHaveValue(props.modelValue.value.destination_city)
        expect(await screen.findByLabelText('Служебное поручение (цель)')).toHaveValue(props.modelValue.value.errand)
        expect(await screen.findByLabelText('Дата начала командировки')).toHaveValue(props.modelValue.value.date_start)
        expect(await screen.findByLabelText('Дата окончания командировки')).toHaveValue(props.modelValue.value.date_end)
        expect(await screen.findByLabelText('Стоимость билетов в обе стороны (если билеты покупаются не через SmartWay)')).toHaveValue(props.modelValue.value.price_tickets)
        expect(await screen.findByLabelText('Стоимость проживания')).toHaveValue(props.modelValue.value.price_living)
        expect(await screen.findByLabelText('Вид суточной ставки')).toHaveValue(props.modelValue.value.per_diem_rate_uuid)
        expect(await screen.findByLabelText('Количество кодов для покупки билетов в SmartWay')).toHaveValue(props.modelValue.value.smartway_codes_count)

        props.modelValue.value.type = 'Изменение условий командировки'
        await rerender(props)

        expect(await screen.findByLabelText('Вид документа')).toHaveValue('Изменение условий командировки')
        expect(await screen.findByLabelText('Документ основание')).toHaveTextContent('Приключение')
    })

    it('emits update when value changes', async () => {
        const props = {
            modelValue: {
                type: '',
                basis_uuid: '',
                organization_uuid: '',
                employee_uuid: '',
                destination_organization: '',
                destination_city: '',
                errand: '',
                date_start: '',
                date_end: '',
                price_tickets: '',
                price_living: '',
                per_diem_rate_uuid: '',
                smartway_codes_count: '',
            },
        }

        const {emitted} = render(Component, {props, global: {plugins: [store]}})

        await userEvent.type(await screen.findByLabelText('Место назначения (организация)'), 'Apple')
        await userEvent.type(await screen.findByLabelText('Место назначения (страна, город)'), 'Москва')

        expect(emitted()).toHaveProperty('update:modelValue')
        expect(emitted()['update:modelValue']).toHaveLength(1)
        expect(emitted()['update:modelValue'][0]).toEqual([{
            type: '',
            basis_uuid: '',
            organization_uuid: '',
            employee_uuid: '',
            destination_organization: 'Apple',
            destination_city: 'Москва',
            errand: '',
            date_start: '',
            date_end: '',
            price_tickets: '',
            price_living: '',
            per_diem_rate_uuid: '',
            smartway_codes_count: '',
        }])
    })

    it('calculated per diem total', async () => {
        const props = {
            modelValue: {
                type: '',
                basis_uuid: '',
                organization_uuid: '',
                employee_uuid: '',
                destination_organization: '',
                destination_city: '',
                errand: '',
                date_start: '',
                date_end: '',
                price_tickets: '',
                price_living: '',
                per_diem_rate_uuid: '',
                smartway_codes_count: '',
            },
        }
        bootstrapStore()

        render(Component, {props, global: {plugins: [store]}})

        expect(screen.queryByText(/Итоговая стоимость:/)).not.toBeInTheDocument()

        await userEvent.type(await screen.findByLabelText('Дата начала командировки'), '2021-01-01')
        await userEvent.type(await screen.findByLabelText('Дата окончания командировки'), '2021-01-31')
        await userEvent.selectOptions(await screen.findByLabelText('Вид суточной ставки'), '2 per diem (2)')

        expect(screen.getByText('Итоговая стоимость: 62')).toBeInTheDocument()
    })
})
