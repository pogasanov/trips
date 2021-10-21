import {within, screen} from "@testing-library/testcafe";
import TestController, {Selector} from 'testcafe';
import {loggedUser} from "../test-helpers";
import {advanceDraftPage, advanceEditorPage, advanceListPage, modal, navbar} from "../pages";


fixture`Advances`
    .beforeEach(async t => {
        await t.useRole(loggedUser)
            .navigateTo('http://localhost:3000/trip')
    })

// Both jest and testcafe exposes `test` globally, which clashes with each other
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
test('Verify preselect values for user', async (t: TestController) => {
    await navbar.goToAdvanceEditorPage()

    await t.expect(screen.getByLabelText('Организация').value)
        .eql('Microsoft')
        .expect(screen.getByLabelText('Сотрудник').value)
        .eql('test')
})

// Both jest and testcafe exposes `test` globally, which clashes with each other
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
test('Verify required fields', async (t: TestController) => {
    await navbar.goToAdvanceEditorPage()
    await advanceEditorPage.submitDocument()

    await t.expect(screen.getByText('Введите Назначение').exists)
        .ok()

    await t.click(screen.getByLabelText('Назначение'))
    await modal.selectItemByName('Неизвестно')
    await advanceEditorPage.submitDocument()

    await t.expect(screen.getByText('Введите Документ основание').exists)
        .ok()

    await advanceEditorPage.goToItemsTab()
    await advanceEditorPage.addNewItem()
    await advanceEditorPage.submitDocument()

    await t.expect(screen.getByText('Введите цену с НДС').exists)
        .ok()
        .expect(screen.getByText('Введите сумму с НДС').exists)
        .ok()
        .expect(screen.getByText('Введите ставку НДС').exists)
        .ok()
})

// Both jest and testcafe exposes `test` globally, which clashes with each other
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
test('Verify user can create new advance, find it in a list and check it content', async (t: TestController) => {
    await navbar.goToAdvanceEditorPage()
    await advanceEditorPage.fillHeaders()
    await advanceEditorPage.goToItemsTab()
    await advanceEditorPage.fillItems()
    await advanceEditorPage.goToFilesTab()

    await t.setFilesToUpload(screen.getByLabelText('Добавить файл'), [
        '../cute_dog.jpg',
    ])
        .expect(screen.getByText("cute_dog.jpg").exists)
        .ok()
        .setFilesToUpload(screen.getByLabelText('Добавить файл'), [
            '../cute_cat.jpg',
        ])
        .expect(screen.getByText("cute_cat.jpg").exists)
        .ok()

    await advanceEditorPage.submitDocument()

    // Verify advance
    await advanceListPage.openDocument()
    await t.expect(screen.getByLabelText('Назначение').textContent)
        .eql('Покупка')

    await advanceEditorPage.goToItemsTab()
    await t.expect(screen.getByDisplayValue('1').exists)
        .ok()
        .expect(screen.getByDisplayValue('15%').exists)
        .ok()

    await advanceEditorPage.goToFilesTab()
    await t.expect(screen.getByText("cute_dog.jpg").exists)
        .ok()
})

// Both jest and testcafe exposes `test` globally, which clashes with each other
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
test('Verify user can update existing advance', async (t: TestController) => {
    await navbar.goToAdvanceListPage()
    await advanceListPage.openDocument()
    await advanceEditorPage.goToItemsTab()

    const rows = screen.getAllByRole('row').filterVisible(),
        firstRow = rows.nth(1),
        secondRow = rows.nth(2)

    await t.typeText(
        within(firstRow).getByLabelText('Поставщик'),
        'ИГС', {replace: true}
    )
        .typeText(
            within(firstRow).getByLabelText('Сумма с НДС'),
            '40', {replace: true}
        )

    await t.typeText(
        within(secondRow).getByLabelText('Содержание'),
        'Приключения'
    )
        .typeText(
            within(secondRow).getByLabelText('Ставка НДС'),
            '20%', {replace: true}
        )

    await advanceEditorPage.goToFilesTab()
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

    await advanceEditorPage.submitDocument()
    await advanceListPage.openDocument()
    await advanceEditorPage.goToItemsTab()

    await t.expect(screen.getByDisplayValue('ИГС').exists)
        .ok()
        .expect(screen.getByDisplayValue('40').exists)
        .ok()
        .expect(screen.getByDisplayValue('Приключения').exists)
        .ok()
        .expect(screen.getByDisplayValue('20%').exists)
        .ok()
        .expect(screen.queryByDisplayValue('2').exists)
        .notOk()
        .expect(screen.queryByDisplayValue('15%').exists)
        .notOk()

    await advanceEditorPage.goToFilesTab()

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
    await navbar.goToAdvanceListPage()

    await t.setFilesToUpload(screen.getByLabelText('Добавить файл'), [
        '../cute_dog.jpg'
    ])

    await advanceListPage.openDocument()
    await advanceEditorPage.goToFilesTab()

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
test('Verify user can create an advance with basis', async (t: TestController) => {
    await navbar.goToAdvanceListPage()
    const documents_before_test = await advanceListPage.documents.with({boundTestRun: t}).count
    await navbar.goToAdvanceEditorPage()

    await t.click(screen.getByLabelText('Назначение'))
        .click(screen.getByText('Неизвестно'))

    await t.click(screen.getByLabelText('Документ основание'))
        .click(Selector('tr').filterVisible().nth(1))

    await advanceEditorPage.submitDocument()

    await t.expect(advanceListPage.documents.count)
        .eql(documents_before_test + 1)
})

// Both jest and testcafe exposes `test` globally, which clashes with each other
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
test('Verify user delete advance from list view', async (t: TestController) => {
    await navbar.goToAdvanceListPage()
    const documents_before_test = await advanceListPage.documents.with({boundTestRun: t}).count

    await t.click(screen.findAllByText('Удалить').nth(1))
        .expect(advanceListPage.documents.count)
        .eql(documents_before_test - 1)
})

// Both jest and testcafe exposes `test` globally, which clashes with each other
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
test('Verify user can create and delete draft', async (t: TestController) => {
    await navbar.goToAdvanceDraftPage()
    const documents_before_test = await advanceDraftPage.documents.with({boundTestRun: t}).count

    await navbar.goToAdvanceEditorPage()
    await advanceEditorPage.fillHeaders()
    await advanceEditorPage.goToItemsTab()
    await advanceEditorPage.fillItems()
    await advanceEditorPage.submitDraft()

    await navbar.goToAdvanceDraftPage()
    await t.expect(advanceDraftPage.documents.count)
        .eql(documents_before_test + 1)
})