import {render, screen} from '@testing-library/vue';
import Component from '../AdvanceItems.vue';
import userEvent from "@testing-library/user-event";
import {ref} from "vue";
import store from '@/store';
import {bootstrapStore} from "@/test-helpers";

describe('AdvanceItems.vue', () => {
    beforeEach(() => {
        bootstrapStore();
    })

    it('renders v-model data when passed', async () => {
        const props = {
            modelValue: ref([
                {
                    'incoming_doc_type': 'Тип',
                    'incoming_doc_date': '2020-10-20',
                    'invoice_number': '123',
                    'invoice_date': '2020-10-21',
                    'partner_uuid': '31',
                    'content': 'б',
                    'quantity': '1',
                    'price': '2',
                    'total': '3',
                    'vat_rate': '10%',
                    'vat_total': '4',
                }
            ])
        }

        render(Component, {props, global: {plugins: [store]}})
        expect(await screen.findByDisplayValue('Тип')).toBeInTheDocument()
        expect(await screen.findByDisplayValue('2020-10-20')).toBeInTheDocument()
        expect(await screen.findByDisplayValue('123')).toBeInTheDocument()
        expect(await screen.findByDisplayValue('2020-10-21')).toBeInTheDocument()
        expect(await screen.findByText('Partner A')).toBeInTheDocument()
        expect(await screen.findByDisplayValue('б')).toBeInTheDocument()
        expect(await screen.findByDisplayValue('1')).toBeInTheDocument()
        expect(await screen.findByDisplayValue('2')).toBeInTheDocument()
        expect(await screen.findByDisplayValue('3')).toBeInTheDocument()
        expect(await screen.findByDisplayValue('10%')).toBeInTheDocument()
        expect(await screen.findByDisplayValue('4')).toBeInTheDocument()

        props.modelValue.value = [
            {
                'incoming_doc_type': 'Другой тип',
                'incoming_doc_date': '2020-10-20',
                'invoice_number': '123',
                'invoice_date': '2020-10-21',
                'partner_uuid': '31',
                'content': 'б',
                'quantity': '1',
                'price': '2',
                'total': '3',
                'vat_rate': '10%',
                'vat_total': '4',
            }
        ]
        expect(await screen.findByDisplayValue('Другой тип')).toBeInTheDocument()
    })

    it('adds new item when add item button is clicked', async () => {
        const props = {
            modelValue: [
                {
                    'incoming_doc_type': 'Тип',
                    'incoming_doc_date': '2020-10-20',
                    'invoice_number': '123',
                    'invoice_date': '2020-10-21',
                    'partner_uuid': '31',
                    'content': 'б',
                    'quantity': '1',
                    'price': '2',
                    'total': '3',
                    'vat_rate': '15%',
                    'vat_total': '4',
                }
            ]
        }
        render(Component, {props, global: {plugins: [store]}})

        await userEvent.click(screen.getByText('Добавить строку'))

        const rows = screen.getAllByRole('row')
        expect(rows.length).toEqual(3)
        expect(rows[2].querySelectorAll('input').length).toEqual(10)
    })

    it('emits update when value changes', async () => {
        const props = {
            modelValue: [
                {
                    'incoming_doc_type': 'Тип',
                    'incoming_doc_date': '2020-10-20',
                    'invoice_number': '123',
                    'invoice_date': '2020-10-21',
                    'partner_uuid': '31',
                    'content': 'б',
                    'quantity': '1',
                    'price': '2',
                    'total': '3',
                    'vat_rate': '15%',
                    'vat_total': '4',
                }
            ]
        }

        const {emitted} = render(Component, {props, global: {plugins: [store]}})
        const fromField = await screen.findByDisplayValue('Тип')
        await userEvent.clear(fromField)
        await userEvent.type(fromField, 'Другой тип')

        expect(emitted()).toHaveProperty('update:modelValue')
        expect(emitted()['update:modelValue']).toHaveLength(1)
        expect(emitted()['update:modelValue'][0]).toEqual([
            [
                {
                    'incoming_doc_type': 'Другой тип',
                    'incoming_doc_date': '2020-10-20',
                    'invoice_number': '123',
                    'invoice_date': '2020-10-21',
                    'partner_uuid': '31',
                    'content': 'б',
                    'quantity': '1',
                    'price': '2',
                    'total': '3',
                    'vat_rate': '15%',
                    'vat_total': '4',
                }
            ]
        ])
    })

    it('deletes row when row delete button clicked', async () => {
        const props = {
            modelValue: [
                {
                    'incoming_doc_type': 'Тип',
                    'incoming_doc_date': '2020-10-20',
                    'invoice_number': '123',
                    'invoice_date': '2020-10-21',
                    'partner_uuid': '31',
                    'content': 'б',
                    'quantity': '1',
                    'price': '2',
                    'total': '3',
                    'vat_rate': '15%',
                    'vat_total': '4',
                }
            ]
        }

        render(Component, {props, global: {plugins: [store]}})

        await userEvent.click(await screen.findByText('-'))

        expect(await screen.queryByDisplayValue('Тип')).not.toBeInTheDocument()
        expect(await screen.queryByDisplayValue('2020-10-20')).not.toBeInTheDocument()
        expect(await screen.queryByDisplayValue('123')).not.toBeInTheDocument()
        expect(await screen.queryByDisplayValue('2020-10-21')).not.toBeInTheDocument()
        expect(await screen.queryByDisplayValue('а')).not.toBeInTheDocument()
        expect(await screen.queryByDisplayValue('б')).not.toBeInTheDocument()
        expect(await screen.queryByDisplayValue('1')).not.toBeInTheDocument()
        expect(await screen.queryByDisplayValue('2')).not.toBeInTheDocument()
        expect(await screen.queryByDisplayValue('3')).not.toBeInTheDocument()
        expect(await screen.queryByDisplayValue('15%')).not.toBeInTheDocument()
        expect(await screen.queryByDisplayValue('4')).not.toBeInTheDocument()
    })
})
