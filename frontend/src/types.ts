export interface Option {
    uuid: string,
    name: string,
}

export type Expenditure = Option & {
    require_basis: boolean,
}

export interface UserInfo {
    uuid: string,
    name: string,
    organization_uuid: string
}

export interface Organization {
    uuid: string,
    name: string,
}

export interface PerDiemRate {
    uuid: string,
    name: string,
    rate: number,
    organization_uuid: string,
    default: boolean,
}

export type Bootstrap = {
    user: UserInfo,
    organizations: Organization[],
    users: UserInfo[],
    partners: Option[],
    per_diem_rates: PerDiemRate[],
}

export interface TripCommon {
    uuid: string,
    number: string,
    date: string,
    name: string,
    status: string,
    condition: string,
    type: string,
    is_draft: boolean,
    is_editable: boolean,
}

export interface TripHeaders {
    type: string,
    basis_uuid: string,
    basis_update_reason: string,
    organization_uuid: string,
    employee_uuid: string,
    destination_organization: string,
    destination_city: string,
    errand: string,
    date_start: string,
    date_end: string,
    price_tickets: number,
    price_living: number,
    per_diem_rate_uuid: string,
    smartway_codes_count: number,
}

export interface TripRoute {
    date: string,
    type: string,
    from: string,
    to: string,
}

export interface TripRoutes {
    routes: TripRoute[]
}

export interface GenericFile {
    uuid?: string,
    name: string,
    content?: string,
}

export interface GenericFiles {
    files: GenericFile[]
}

export type TripFull = TripHeaders & TripCommon & TripRoutes & GenericFiles

export interface AdvanceHeaders {
    organization_uuid: string,
    employee_uuid: string,
    purpose_uuid: string,
    basis_uuid: string,
}

export interface AdvanceCommon {
    uuid: string,
    number: string,
    date: string,
    name: string,
    status: string,
    condition: string,
    total_price: number,
    is_draft: boolean,
    is_editable: boolean,
}

export interface AdvanceItem {
    incoming_doc_type: string,
    incoming_doc_number: string,
    incoming_doc_date: string,
    invoice_number: string,
    invoice_date: string,
    partner_uuid: string,
    content: string,
    quantity: number,
    price: number,
    total: number,
    vat_rate: string,
    vat_total: number,
}

export interface AdvanceItems {
    items: AdvanceItem[]
}

export type AdvanceFull = AdvanceHeaders & AdvanceCommon & AdvanceItems & GenericFiles