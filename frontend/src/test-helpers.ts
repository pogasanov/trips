import store from "@/store";
import {screen} from "@testing-library/vue";
import {AdvanceFull, TripFull} from "@/types";

export const tripShowPayload: TripFull = {
    uuid: '1',
    number: '1',
    date: '2020-01-01',
    name: 'Название',
    status: 'Согласован',
    condition: 'Согласован',
    type: 'Заявка на командировку',
    basis_uuid: '',
    basis_update_reason: '',
    organization_uuid: '12',
    employee_uuid: '22',
    destination_organization: '',
    destination_city: '',
    errand: '',
    date_start: '',
    date_end: '',
    price_tickets: 0,
    price_living: 0,
    per_diem_rate_uuid: '',
    smartway_codes_count: 0,
    routes: [],
    files: [],
    is_draft: true,
    is_editable: true,
}

export const advanceShowPayload: AdvanceFull = {
    uuid: '1',
    number: '1',
    date: '2020-01-01',
    name: 'Название',
    status: 'Согласован',
    condition: 'Согласован',
    total_price: 0,
    organization_uuid: '12',
    employee_uuid: '22',
    basis_uuid: '',
    purpose_uuid: '',
    items: [],
    files: [],
    is_draft: true,
    is_editable: true,
}

export const bootstrapStore = (): void => {
    store.state.bootstrap.user.organization_uuid = '11'
    store.state.bootstrap.user.name = 'Dummy'
    store.state.bootstrap.user.uuid = '21'
    store.state.bootstrap.organizations = [{
        uuid: '11',
        name: 'Microsoft'
    }, {
        uuid: '12',
        name: 'Apple'
    }]
    store.state.bootstrap.users = [{
        uuid: '21',
        name: 'Иван',
        organization_uuid: '11',
    }, {
        uuid: '22',
        name: 'Петя',
        organization_uuid: '12',
    }]
    store.state.bootstrap.partners = [{
        uuid: '31',
        name: 'Partner A'
    }, {
        uuid: '32',
        name: 'Partner B'
    }]
    store.state.bootstrap.per_diem_rates = [{
        uuid: '41',
        name: '1 per diem',
        rate: 1,
        organization_uuid: '11',
        default: true,
    }, {
        uuid: '42',
        name: '2 per diem',
        rate: 2,
        organization_uuid: '11',
        default: false,
    }]
    store.state.bootstrap.bootstrapFinished = Promise.resolve()
}

export const actAsLoggedUser = (): void => {
    store.state.auth.token = 'test'
}

export const assertTripListView = async (): Promise<void> => {
    expect(await screen.findByText('Номер')).toBeInTheDocument()
    expect(await screen.findByText('Статус согласования')).toBeInTheDocument()
}

export const assertTripDraftsView = async (): Promise<void> => {
    expect(await screen.findByText('Номер')).toBeInTheDocument()
    expect(await screen.queryByText('Статус согласования')).not.toBeInTheDocument()
}

export const assertTripCreateView = async (): Promise<void> => {
    expect(await screen.findByText('Маршрут')).toBeInTheDocument()
}

export const mockFileReader = (result: string): void => {
    window.FileReader = jest.fn().mockImplementation(() => {
        return {
            readAsDataURL: function () {
                this.onloadend()
            },
            result
        }
    }) as unknown as jest.MockedClass<typeof FileReader>;
}