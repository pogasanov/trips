import {render, screen} from '@testing-library/vue';
import Component from '../DateRangeModal.vue';
import userEvent from "@testing-library/user-event";
import {bootstrapStore} from "@/test-helpers";
import store from "@/store";
import {AdvanceItem} from "@/types";

describe('DateRangeModal.vue', () => {
    it('call fetchItems prop when refresh button is clicked', async () => {
        bootstrapStore()
        const fetchItems = jest.fn(() => ([{
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
        }]))
        render(Component, {
            props: {
                fetchItems
            },
            global: {
                plugins: [store]
            }
        })

        await userEvent.type(screen.getByLabelText('От'), '2020-10-12');
        await userEvent.type(screen.getByLabelText('До'), '2020-11-12');
        expect(fetchItems).not.toBeCalled()
        // TODO: find out why hidden is required
        await userEvent.click(await screen.findByRole('button', {name: 'Обновить', hidden: true}))

        expect(fetchItems).toBeCalled()
        expect(await screen.findByText('Тип')).toBeInTheDocument()
        expect(screen.getByText('2020-10-20')).toBeInTheDocument()
        expect(screen.getByText('123')).toBeInTheDocument()
        expect(screen.getByText('2020-10-21')).toBeInTheDocument()
        expect(screen.getByText('Partner A')).toBeInTheDocument()
        expect(screen.getByText('б')).toBeInTheDocument()
        expect(screen.getByText('1')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
        expect(screen.getByText('15%')).toBeInTheDocument()
        expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('doesnt fetch items when range is partially selected', async () => {
        const fetchItems = jest.fn()
        render(Component, {
            props: {
                fetchItems
            }
        })

        await userEvent.type(screen.getByLabelText('От'), '2020-10-12');
        await userEvent.click(await screen.findByRole('button', {name: 'Обновить', hidden: true}))
        expect(fetchItems).not.toBeCalled()
        await userEvent.clear(screen.getByLabelText('От'))
        await userEvent.type(screen.getByLabelText('До'), '2020-11-12');
        await userEvent.click(await screen.findByRole('button', {name: 'Обновить', hidden: true}))
        expect(fetchItems).not.toBeCalled()
    })

    it('clicking confirm generates event with selected rows', async () => {
        bootstrapStore()
        const fetchItems = jest.fn(() => ([{
            'incoming_doc_type': 'Тип',
            'incoming_doc_date': '2020-10-20',
            'invoice_number': '111',
            'invoice_date': '2020-10-21',
            'partner_uuid': '31',
            'content': 'б',
            'quantity': '1',
            'price': '2',
            'total': '3',
            'vat_rate': '15%',
            'vat_total': '4',
        }, {
            'incoming_doc_type': 'Тип',
            'incoming_doc_date': '2020-10-20',
            'invoice_number': '222',
            'invoice_date': '2020-10-21',
            'partner_uuid': '31',
            'content': 'б',
            'quantity': '1',
            'price': '2',
            'total': '3',
            'vat_rate': '15%',
            'vat_total': '4',
        }, {
            'incoming_doc_type': 'Тип',
            'incoming_doc_date': '2020-10-20',
            'invoice_number': '333',
            'invoice_date': '2020-10-21',
            'partner_uuid': '31',
            'content': 'б',
            'quantity': '1',
            'price': '2',
            'total': '3',
            'vat_rate': '15%',
            'vat_total': '4',
        }]))
        const {emitted} = render(Component, {
            props: {
                fetchItems
            },
            global: {
                plugins: [store]
            }
        })

        await userEvent.type(screen.getByLabelText('От'), '2020-10-12');
        await userEvent.type(screen.getByLabelText('До'), '2020-11-12');
        await userEvent.click(await screen.findByRole('button', {name: 'Обновить', hidden: true}))

        await userEvent.click(await screen.findByText('111'))
        await userEvent.click(await screen.findByText('333'))
        // TODO: find out why hidden is required
        await userEvent.click(await screen.findByRole('button', {name: 'Подтвердить', hidden: true}))

        expect(emitted()).toHaveProperty('itemSelected')
        expect(emitted()['itemSelected']).toHaveLength(1)
        expect((emitted()['itemSelected'][0] as AdvanceItem[][])[0]).toHaveLength(2)
        expect((emitted()['itemSelected'][0] as AdvanceItem[][])[0][0]['invoice_number']).toEqual('111')
        expect((emitted()['itemSelected'][0] as AdvanceItem[][])[0][1]['invoice_number']).toEqual('333')
    })
})
