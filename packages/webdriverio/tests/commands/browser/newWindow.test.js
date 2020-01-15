/**
 * @jest-environment jsdom
 */

global.window.open = jest.fn()

import got from 'got'
import { remote } from '../../../src'

describe('newWindow', () => {
    it('should allow to create a new window handle', async () => {
        const browser = await remote({
            baseUrl: 'http://foobar.com',
            capabilities: {
                browserName: 'foobar'
            }
        })

        await browser.newWindow('https://webdriver.io', 'some name', 'some params')
        expect(got.mock.calls).toHaveLength(4)
        expect(got.mock.calls[1][1].json.args)
            .toEqual(['https://webdriver.io', 'some name', 'some params'])
        expect(got.mock.calls[2][1].uri.pathname)
            .toContain('/window/handles')
        expect(got.mock.calls[3][1].json.handle)
            .toBe('window-handle-3')
    })

    it('should fail if url is invalid', async () => {
        const browser = await remote({
            baseUrl: 'http://foobar.com',
            capabilities: {
                browserName: 'foobar'
            }
        })
        expect.hasAssertions()

        try {
            await browser.newWindow({})
        } catch (e) {
            expect(e.message).toContain('number or type')
        }
    })

    it('should fail if browser is a mobile device', async () => {
        const browser = await remote({
            baseUrl: 'http://foobar.com',
            capabilities: {
                browserName: 'ipad',
                mobileMode: true
            }
        })
        expect.hasAssertions()

        try {
            await browser.newWindow('https://webdriver.io', 'some name', 'some params')
        } catch (e) {
            expect(e.message).toContain('not supported on mobile')
        }
    })
})
