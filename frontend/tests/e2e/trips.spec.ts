import {screen, within} from "@testing-library/testcafe";
import TestController, {Selector} from 'testcafe';
import {loggedUser} from "../test-helpers";
import {modal, navbar, tripEditorPage, tripListPage} from "../pages";


fixture`Trips`
    .beforeEach(async t => {
        await t.useRole(loggedUser)
            .navigateTo('http://localhost:3000/trip')
    })

// Both jest and testcafe exposes `test` globally, which clashes with each other
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
test('Verify preselect values for user', async (t: TestController) => {
    await navbar.goToTripEditorPage()

    await t.expect(screen.getByLabelText('Организация').value)
        .eql('Microsoft')
        .expect(screen.getByLabelText('Сотрудник').value)
        .eql('test')
})

// Both jest and testcafe exposes `test` globally, which clashes with each other
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
test('Verify required fields', async (t: TestController) => {
    await navbar.goToTripEditorPage()

    await tripEditorPage.submitDocument()

    await t.expect(screen.getByText('Введите Вид документа').exists)
        .ok()
        .expect(screen.getByText('Введите Место назначения (организация)').exists)
        .ok()
        .expect(screen.getByText('Введите Место назначения (страна, город)').exists)
        .ok()
        .expect(screen.getByText('Введите Служебное поручение (цель)').exists)
        .ok()
        .expect(screen.getByText('Введите Дата начала командировки').exists)
        .ok()
        .expect(screen.getByText('Введите Дата окончания командировки').exists)
        .ok()
        .expect(screen.getByText('Введите Вид суточной ставки').exists)
        .ok()

    await t
        .click(screen.getByLabelText('Вид документа'))
        .click(screen.getByText('Изменение условий командировки'))

    await tripEditorPage.submitDocument()

    await t.expect(screen.getByText('Введите Документ основание').exists)
        .ok()

    await tripEditorPage.goToRoutesTab()
    await tripEditorPage.addNewRoute()
    await tripEditorPage.submitDocument()

    await t.expect(screen.getByText('Введите дату').exists)
        .ok()
        .expect(screen.getByText('Введите вид транспорта').exists)
        .ok()
        .expect(screen.getByText('Введите откуда (город)').exists)
        .ok()
        .expect(screen.getByText('Введите куда (город)').exists)
        .ok()
})

// Both jest and testcafe exposes `test` globally, which clashes with each other
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
test('Verify user can create new trip, find it in a list and check it content', async (t: TestController) => {
    await navbar.goToTripEditorPage()
    await tripEditorPage.fillHeaders()
    await tripEditorPage.goToRoutesTab()
    await tripEditorPage.fillRoutes()

    await t.click(screen.getByText('Файлы'))
        .setFilesToUpload(screen.getByLabelText('Добавить файл'), [
            '../cute_dog.jpg',
        ])
        .expect(screen.getByText("cute_dog.jpg").exists)
        .ok()
        .setFilesToUpload(screen.getByLabelText('Добавить файл'), [
            '../cute_cat.jpg',
        ])
        .expect(screen.getByText("cute_cat.jpg").exists)
        .ok()

    await tripEditorPage.submitDocument()

    // Verify trip
    await tripListPage.openDocumentByIndex(2)

    await t.expect(screen.getByLabelText('Организация').value)
        .eql('Microsoft')
        .expect(screen.getByLabelText('Дата начала командировки').value)
        .eql('2020-10-20')

    await tripEditorPage.goToRoutesTab()

    await t.expect(screen.getByDisplayValue('Краснодар').exists)
        .ok()
        .expect(screen.getByDisplayValue('Санкт-Петербург').exists)
        .ok()

    await tripEditorPage.goToFilesTab()

    await t.expect(screen.getByText("cute_dog.jpg").exists)
        .ok()
})

// Both jest and testcafe exposes `test` globally, which clashes with each other
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
test('Verify user can update existing trip', async (t: TestController) => {
    await navbar.goToTripListPage()
    await tripListPage.openDocumentByIndex(2)

    await t.typeText(
            screen.getByLabelText('Служебное поручение (цель)'),
            'Задача', {replace: true}
        )

    await tripEditorPage.goToRoutesTab()

    const routeSecondRow = screen.getAllByRole('row').filterVisible().nth(2)
    const input = within(routeSecondRow).getByLabelText('Вид транспорта')

    await t.typeText(input, 'Вертолёт', {replace: true})

    await tripEditorPage.goToFilesTab()

    const filesSecondRow = screen.getAllByRole('row').filterVisible().nth(2)

    await t.click(within(filesSecondRow).getByText("X"))
        .expect(screen.getByText("cute_cat.jpg").exists)
        .ok()
        .expect(screen.queryByText("cute_dog.jpg").exists)
        .notOk()

    await t.setFilesToUpload(screen.getByLabelText('Добавить файл'), [
        '../cute_snake.jpg'
    ])
        .expect(screen.getByText("cute_snake.jpg").exists)
        .ok()

    await tripEditorPage.submitDocument()
    await tripListPage.openDocumentByIndex(2)

    await t.expect(screen.getByLabelText('Служебное поручение (цель)').value)
        .eql('Задача')

    await tripEditorPage.goToRoutesTab()

    await t.expect(screen.getByDisplayValue('Авто').exists)
        .ok()
        .expect(screen.getByDisplayValue('Вертолёт').exists)
        .ok()
        .expect(screen.queryByDisplayValue('Самолёт').exists)
        .notOk()

    await tripEditorPage.goToFilesTab()

    await t.expect(screen.getByText("cute_cat.jpg").exists)
        .ok()
        .expect(screen.getByText("cute_snake.jpg").exists)
        .ok()
        .expect(screen.queryByText("cute_dog.jpg").exists)
        .notOk()
})

// Both jest and testcafe exposes `test` globally, which clashes with each other
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
test('Verify user can add file from list view', async (t: TestController) => {
    await navbar.goToTripListPage()

    await t.setFilesToUpload(within(tripListPage.documents.with({boundTestRun: t}).nth(2)).getByLabelText('Добавить файл'), [
        '../cute_dog.jpg'
    ])

    await tripListPage.openDocumentByIndex(2)
    await tripEditorPage.goToFilesTab()

    await t.expect(screen.getByText("cute_cat.jpg").exists)
        .ok()
        .expect(screen.getByText("cute_snake.jpg").exists)
        .ok()
        .expect(screen.queryByText("cute_dog.jpg").exists)
        .ok()
})

// Both jest and testcafe exposes `test` globally, which clashes with each other
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
test('Verify user can create an edit to existing trip', async (t: TestController) => {
    await navbar.goToTripListPage()
    const documents_before_test = await tripListPage.documents.with({boundTestRun: t}).count

    await navbar.goToTripEditorPage()
    await tripEditorPage.fillHeaders()

    await t
        .click(screen.getByLabelText('Вид документа'))
        .click(screen.getByText('Изменение условий командировки'))

    await t.click(screen.getByLabelText('Документ основание'))

    await modal.selectItemByName('Тестовая поездка')

    await t.expect(screen.getByLabelText('Служебное поручение (цель)').value)
        .eql('Задача')

    await t.click(screen.getByText('Маршрут'))
        .expect(screen.getByDisplayValue('Авто').exists)
        .ok()
        .expect(screen.getByDisplayValue('Самолёт').exists)
        .ok()

    await t.click(screen.getByText('Файлы'))
        .expect(screen.getByText("cute_cat.jpg").exists)
        .ok()
        .expect(screen.getByText("cute_dog.jpg").exists)
        .ok()

    await tripEditorPage.submitDocument()
    await t.expect(tripListPage.documents.count)
        .eql(documents_before_test + 1)
})

// Both jest and testcafe exposes `test` globally, which clashes with each other
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
test('Verify user delete trip from list view', async (t: TestController) => {
    await navbar.goToTripListPage()
    const documents_before_test = await tripListPage.documents.with({boundTestRun: t}).count

    await t.click(within(tripListPage.documents.with({boundTestRun: t}).nth(3)).findByText('Удалить'))
        .expect(tripListPage.documents.count)
        .eql(documents_before_test - 1)
})

// Both jest and testcafe exposes `test` globally, which clashes with each other
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
test('Verify user can create and delete draft', async (t: TestController) => {
    await navbar.goToTripEditorPage()
    await tripEditorPage.fillHeaders()
    await tripEditorPage.goToRoutesTab()
    await tripEditorPage.fillRoutes()
    await tripEditorPage.submitDraft()

    await navbar.goToTripDraftPage()

    await t.expect(Selector('tr').filterVisible().count)
        .eql(2)

    await t.click(screen.findByText('Удалить'))
        .expect(Selector('tr').filterVisible().count)
        .eql(1)
})