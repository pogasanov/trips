import {fireEvent, render, screen} from '@testing-library/vue';
import MenuLink from '../MenuLink.vue';
import {createRouter, createWebHistory} from "vue-router";

describe('MenuLink.vue', () => {
    it('redirects when clicked', async () => {
        const App = {
            template: `<menu-link route-name="posts">Go to posts</menu-link><router-view />`,
            components: {MenuLink}
        }

        const router = createRouter({
            history: createWebHistory(),
            routes: [
                {
                    path: '/',
                    component: {
                        template: 'Welcome to home page'
                    }
                },
                {
                    path: '/posts',
                    name: 'posts',
                    component: {
                        template: `Welcome to posts page`,
                    }
                }
            ]
        })

        render(App, {
            global: {
                plugins: [router]
            }
        })
        await screen.findByText('Welcome to home page')

        const linkButton = screen.getByRole('button', {name: /Go to posts/i})
        await fireEvent.click(linkButton)

        await screen.findByText('Welcome to posts page')
    })
})
