import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',

    // Таймауты
    timeout: 25000,
    expect: {
        timeout: 10000
    },

    // Запуск тестов
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : 1,

    // Репортеры
    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report' }],
        ['allure-playwright', {
            detail: true,
            outputFolder: 'allure-results',
            suiteTitle: true,
            categories: [
                {
                    name: 'Navigation errors',
                    messageRegex: '.*URL.*',
                },
                {
                    name: 'Element not found',
                    messageRegex: '.*locator.*not found.*',
                },
                {
                    name: 'Timeout errors',
                    messageRegex: '.*timeout.*exceeded.*',
                }
            ],
            environmentInfo: {
                os_platform: process.platform,
                os_release: process.version,
                node_version: process.version,
                browser: 'chromium'
            }
        }]
    ],

    use: {
        baseURL: 'https://afisha.yandex.ru',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 15000,
        navigationTimeout: 30000,
    },

    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 }
            },
        },
    ],
});