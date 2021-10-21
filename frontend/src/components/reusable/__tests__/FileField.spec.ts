import {render, screen} from "@testing-library/vue";
import Component from '../FileField.vue';
import userEvent from "@testing-library/user-event";

describe('FileField.vue', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        window.FileReader = jest.fn().mockImplementation(() => {
            return {
                readAsDataURL: function () {
                    this.onloadend()
                },
                result: 'hello'
            }
        }) as unknown as jest.MockedClass<typeof FileReader>;
    })

    it.skip('dummy', async () => {
        // TODO: do this test
    })

    it('emits update when value changes', async () => {
        const file = new File(['hello'], 'hello.png', {type: 'image/png'})

        const {emitted} = render(Component, {
            props: {
                id: 'file-id'
            },
            slots: {
                default: "Im a file!"
            }
        })

        await userEvent.upload(screen.getByLabelText("Im a file!"), file)

        expect(emitted()).toHaveProperty('change')
        expect(emitted()['change']).toHaveLength(1)
        expect(emitted()['change'][0]).toEqual([{
            "content": "hello",
            "name": "hello.png",
        }])
    })

    it('allows same file to be inputted twice', async () => {
        const file = new File(['hello'], 'hello.png', {type: 'image/png'})

        const {emitted} = render(Component, {
            props: {
                id: 'file-id'
            },
            slots: {
                default: "Im a file!"
            }
        })

        await userEvent.upload(screen.getByLabelText("Im a file!"), file)
        await userEvent.upload(screen.getByLabelText("Im a file!"), file)
        expect(emitted()).toHaveProperty('change')
        expect(emitted()['change']).toHaveLength(2)
        expect(emitted()['change'][0]).toEqual([{
            "content": "hello",
            "name": "hello.png",
        }])
        expect(emitted()['change'][1]).toEqual([{
            "content": "hello",
            "name": "hello.png",
        }])
    })
})
