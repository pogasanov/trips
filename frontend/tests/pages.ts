import {Selector, t} from 'testcafe';
import {screen, within} from "@testing-library/testcafe";


class Navbar {
    async goToTripListPage() {
        await t.click(screen.getByText('Список отправленных заявок на командировку/изменений условий командировки'))
    }

    async goToTripEditorPage() {
        await t.click(screen.getByText('Создать заявку на командировку/изменения условий командировки'))
    }

    async goToTripDraftPage() {
        await t.click(screen.getByText('Черновики заявок на командировку/изменений условий командировки'))
    }

    async goToAdvanceListPage() {
        await t.click(screen.getByText('Список отправленных авансовых отчетов'))
    }

    async goToAdvanceEditorPage() {
        await t.click(screen.getByText('Создать авансовый отчет'))
    }

    async goToAdvanceDraftPage() {
        await t.click(screen.getByText('Черновики авансовых отчетов'))
    }
}

export const navbar = new Navbar()

class Modal {
    async selectItemByName(name: string) {
        // Selector('tr').filterVisible().nth(name)
        await t.click(screen.getByText(name))
    }
}

export const modal = new Modal()

class GenericListPage {
    public documents: Selector;

    constructor() {
        this.documents = Selector('tr').filterVisible()
    }

    async openDocument() {
        await t.click(screen.findByText('Просмотр'))
    }

    async openDocumentByIndex(index: number) {
        await t.click(within(this.documents.nth(index)).findByText('Просмотр'))
    }
}

class TripListPage extends GenericListPage {
}

export const tripListPage = new TripListPage()

class AdvanceListPage extends GenericListPage {
}

export const advanceListPage = new AdvanceListPage()

class TripDraftPage extends GenericListPage {

}

export const tripDraftPage = new TripDraftPage()

class AdvanceDraftPage extends GenericListPage {

}

export const advanceDraftPage = new AdvanceDraftPage()

class GenericEditorPage {
    async submitDocument() {
        await t.click(screen.getByText('Отправить на согласование'))
    }

    async submitDraft() {
        await t.click(screen.getByText('Сохранить черновик'))
    }

    async goToFilesTab() {
        await t.click(screen.getByText('Файлы'))
    }
}

class AdvanceEditorPage extends GenericEditorPage{
    async goToItemsTab() {
        await t.click(screen.getByText('Авансовый отчёт'))
    }

    async addNewItem() {
        await t.click(screen.getByText('Добавить новый отчёт'))
    }

    async fillHeaders() {
        await t.click(screen.getByLabelText('Назначение'))
            .click(screen.getByText('Покупка'))
    }

    async fillItems() {
        await this.addNewItem()
        await this.addNewItem()

        const rows = screen.getAllByRole('row').filterVisible(),
            firstRow = rows.nth(1),
            secondRow = rows.nth(2)

        await t.typeText(
            within(firstRow).getByLabelText('Цена с НДС'),
            '1', {replace: true}
        ).typeText(
            within(firstRow).getByLabelText('Сумма с НДС'),
            '2', {replace: true}
        ).typeText(
            within(firstRow).getByLabelText('Ставка НДС'),
            '13%', {replace: true}
        )

        await t.typeText(
            within(secondRow).getByLabelText('Цена с НДС'),
            '3', {replace: true}
        ).typeText(
            within(secondRow).getByLabelText('Сумма с НДС'),
            '4', {replace: true}
        ).typeText(
            within(secondRow).getByLabelText('Ставка НДС'),
            '15%', {replace: true}
        )
    }
}

export const advanceEditorPage = new AdvanceEditorPage()

class TripEditorPage extends GenericEditorPage {
    async goToRoutesTab() {
        await t.click(screen.getByText('Маршрут'))
    }

    async addNewRoute() {
        await t.click(screen.getByText('Добавить новый маршрут'))
    }

    async fillHeaders() {
        await t
            .click(screen.getByLabelText('Вид документа'))
            .click(screen.getByText('Заявка на командировку'))
            .typeText(
                screen.getByLabelText('Место назначения (организация)'),
                'Amazon'
            )
            .typeText(
                screen.getByLabelText('Место назначения (страна, город)'),
                'Краснокаменск'
            )
            .typeText(
                screen.getByLabelText('Служебное поручение (цель)'),
                'Приключения'
            )
            .typeText(
                screen.getByLabelText('Дата начала командировки'),
                '2020-10-20'
            )
            .typeText(
                screen.getByLabelText('Дата окончания командировки'),
                '2020-11-21'
            )
            .typeText(
                screen.getByLabelText('Стоимость билетов в обе стороны'),
                '111'
            )
            .typeText(
                screen.getByLabelText('Стоимость проживания'),
                '222'
            )
            .typeText(
                screen.getByLabelText('Вид суточной ставки'),
                'Посуточная'
            )
            .typeText(
                screen.getByLabelText('Количество кодов для покупки билетов в SmartWay'),
                '2'
            )
    }

    async fillRoutes() {
        await this.addNewRoute()
        await this.addNewRoute()

        const rows = screen.getAllByRole('row').filterVisible(),
            firstRow = rows.nth(1),
            secondRow = rows.nth(2)

        await t.typeText(
            within(firstRow).getByLabelText('Дата'),
            '2020-10-11', {replace: true}
        ).typeText(
            within(firstRow).getByLabelText('Вид транспорта'),
            'Авто', {replace: true}
        ).typeText(
            within(firstRow).getByLabelText('Откуда (город)'),
            'Краснодар', {replace: true}
        ).typeText(
            within(firstRow).getByLabelText('Куда (город)'),
            'Красноярск', {replace: true}
        )

        await t.typeText(
            within(secondRow).getByLabelText('Дата'),
            '2020-10-12', {replace: true}
        ).typeText(
            within(secondRow).getByLabelText('Вид транспорта'),
            'Самолёт', {replace: true}
        ).typeText(
            within(secondRow).getByLabelText('Откуда (город)'),
            'Москва', {replace: true}
        ).typeText(
            within(secondRow).getByLabelText('Куда (город)'),
            'Санкт-Петербург', {replace: true}
        )
    }
}

export const tripEditorPage = new TripEditorPage()
