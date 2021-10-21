import {render, screen} from '@testing-library/vue';
import Component from '../Tab.vue';

describe('Tab.vue', () => {
    it('shows content', async () => {
        render(Component, {
            props: {
                name: 'Вкладка',
                id: 'tab'
            },
            slots: {
                default: ['content!']
            },
            global: {
                provide: {
                    'tabsProvider': {
                        tabs: []
                    }
                }
            }
        })

        await screen.getByText('content!')
    })

    it('populate tabsProvider with itself', async () => {
        const tabs: {
          name: string,
          header: string,
          isDisabled: boolean,
          hash: string,
          index: number
        }[] = []

        render(Component, {
            props: {
                name: 'Вкладка',
                id: 'tab'
            },
            slots: {
                default: ['content!']
            },
            global: {
                provide: {
                    'tabsProvider': {
                        tabs
                    }
                }
            }
        })

        expect(tabs.length).not.toEqual(0)
    })
})
