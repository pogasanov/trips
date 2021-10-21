import {screen} from "@testing-library/testcafe";
import TestController, {Role} from "testcafe";

const userDetails = {
    username: 'test',
    pin: '987123'
}

export const loggedUser = Role('http://localhost:3000', async (t: TestController): Promise<void> => {
    await t.typeText(
        screen.getByLabelText('Имя пользователя'),
        userDetails.username
    )
        .click(screen.getByText('Запросить пин'))
        .typeText(
            screen.getByLabelText('Пин код'),
            userDetails.pin
        )
        .click(screen.getByText('Войти'))
}, { preserveUrl: true })