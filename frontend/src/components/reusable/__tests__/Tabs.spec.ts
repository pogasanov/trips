import {render, screen} from '@testing-library/vue';
import Component from '../Tabs.vue';
import Tab from '../Tab.vue';

describe.skip('Tabs.vue', () => {
    it('shows multiple tabs', async () => {
        render(Component, {
            slots: {
                default: '<tab name="test">Content!</tab>'
            },
            global: {
                components: {
                    Tab
                },
            }
        })

        await screen.getByText('Content!')
    })
})
