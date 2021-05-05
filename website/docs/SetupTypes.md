---
id: setuptypes
title: Setup Types
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

WebdriverIO can be used for various purposes. It implements the WebDriver protocol API and can run a browser in an automated way. The framework is designed to work in any arbitrary environment and for any kind of task. It is independent from any 3rd party frameworks and only requires Node.js to run.

## Protocol Bindings

For basic interactions with the WebDriver and other automation protocols WebdriverIO uses its own protocol bindings based on the [`webdriver`](https://www.npmjs.com/package/webdriver) NPM package:

<Tabs
  defaultValue="webdriver"
  values={[
    {label: 'WebDriver', value: 'webdriver'},
    {label: 'Chrome DevTools', value: 'devtools'},
  ]
}>
<TabItem value="webdriver">

```js
const WebDriver = require('webdriver');

(async () => {
    const client = await WebDriver.newSession({
        capabilities: { browserName: 'firefox' }
    })

    await client.navigateTo('https://www.google.com/ncr')

    const searchInput = await client.findElement('css selector', '#lst-ib')
    await client.elementSendKeys(searchInput['element-6066-11e4-a52e-4f735466cecf'], 'WebDriver')

    const searchBtn = await client.findElement('css selector', 'input[value="Google Search"]')
    await client.elementClick(searchBtn['element-6066-11e4-a52e-4f735466cecf'])

    console.log(await client.getTitle()) // outputs "WebDriver - Google Search"

    await client.deleteSession()
})()
```

</TabItem>
<TabItem value="devtools">

```js
const DevTools = require('devtools');

(async () => {
    const client = await DevTools.newSession({
        capabilities: { browserName: 'firefox' }
    })

    await client.navigateTo('https://www.google.com/ncr')

    const searchInput = await client.findElement('css selector', '#lst-ib')
    await client.elementSendKeys(searchInput['element-6066-11e4-a52e-4f735466cecf'], 'WebDriver')

    const searchBtn = await client.findElement('css selector', 'input[value="Google Search"]')
    await client.elementClick(searchBtn['element-6066-11e4-a52e-4f735466cecf'])

    console.log(await client.getTitle()) // outputs "WebDriver - Google Search"

    await client.deleteSession()
})()
```

</TabItem>
</Tabs>

All [protocol commands](./api/_webdriver.md) return the raw response from the automation driver. The package is very lightweight and there is __no__ smart logic like auto-waits to simplify the interaction with the protocol usage. You can run the same set of commands using the Chrome DevTools protocol when importing the [`devtools`](https://www.npmjs.com/package/devtools) NPM package.

### Package APIs

The protocol packages ([`webdriver`](https://www.npmjs.com/package/webdriver) and [`devtools`](https://www.npmjs.com/package/devtools)) expose a class with the following static functions attached that allow you to initiate sessions:

#### `newSession(options, modifier, userPrototype, customCommandWrapper)`

Starts a new session with specific capabilities. Based on the session response commands from different protocols will be provided.

##### Paramaters

- `options`: [WebDriver Options](/docs/options#webdriver-options)
- `modifier`: function that allows to modify the client instance before it is being returned
- `userPrototype`: properties object that allows to extend the instance prototype
- `customCommandWrapper`: function that allows to wrap functionality around function calls

##### Example

```js
const client = await WebDriver.newSession({
    capabilities: { browserName: 'chrome' }
})
```

#### `attachSession(attachInstance, modifier, userPrototype, customCommandWrapper)`

Attaches to a running WebDriver or DevTools session.

##### Paramaters

- `attachInstance`: instance to attach a session to or at least an object with a property `sessionId` (e.g. `{ sessionId: 'xxx' }`)
- `modifier`: function that allows to modify the client instance before it is being returned
- `userPrototype`: properties object that allows to extend the instance prototype
- `customCommandWrapper`: function that allows to wrap functionality around function calls

##### Example

```js
const client = await WebDriver.newSession({...})
const clonedClient = await WebDriver.attachSession(client)
```

#### `reloadSession(instance)`

Reloads a session given provided instance.

##### Paramaters

- `instance`: package instance to reload

##### Example

```js
const client = await WebDriver.newSession({...})
await WebDriver.reloadSession(client)
```

## Standalone Mode

To simplify the interaction with the WebDriver protocol the `webdriverio` package implements a variety of commands on top of the protocol (e.g. the [`dragAndDrop`](./api/element/_dragAndDrop.md) command) and core concepts such as [smart selectors](./Selectors.md) or [auto-waits](./AutoWait.md). The example from above can be simplified like this:

```js
const { remote } = require('webdriverio');

(async () => {
    const browser = await remote({
        logLevel: 'trace',
        capabilities: {
            browserName: 'chrome'
        }
    })

    await browser.url('https://duckduckgo.com')

    const inputElem = await browser.$('#search_form_input_homepage')
    await inputElem.setValue('WebdriverIO')

    const submitBtn = await browser.$('#search_button_homepage')
    await submitBtn.click()

    console.log(await browser.getTitle()) // outputs: "Title is: WebdriverIO (Software) at DuckDuckGo"

    await browser.deleteSession()
})().catch((e) => console.error(e))
```

Using WebdriverIO in standalone mode still gives you access to all protocol commands but provides a super set of additional commands that provide a higher level interaction with the browser. It allows you to integrate this automation tool in your own (test) project to create a new automation library. Popular examples include [Spectron](https://www.electronjs.org/spectron) or [CodeceptJS](http://codecept.io). You can also write plain Node scripts to scrape the web for content (or anything else that requires a running browser).

If no specific options are set WebdriverIO will try to find a browser driver on `http://localhost:4444/` and automatically switches to the Chrome DevTools protocol and Puppeteer as automation engine if such a driver can't be found. If you like to run based on WebDriver you need to either start that driver manually or through a script or [NPM package](https://www.npmjs.com/package/chromedriver).

You can use the `@wdio/sync` package to transform all commands so they run synchronously. This especially simplifies your test as you don't have to deal with `async/await` anymore. Here is an example how you can run synchronous commands with WebdriverIO in a standalone script:

```js
// standalone.js
const { remote } = require('webdriverio')
const sync = require('@wdio/sync').default

remote({
    runner: 'local',
    outputDir: __dirname,
    capabilities: {
        browserName: 'chrome'
    }
}).then((browser) => sync(() => {
    browser.url('https://webdriver.io')
    console.log(browser.getTitle())
    browser.deleteSession()
}))
```

If you now run the file, it will return the title:

```bash
$ node standalone.js
WebdriverIO · Next-gen browser and mobile automation test framework for Node.js
```

### Package API

Similar as to the protocol packages (`webdriver` and `devtools`) you can also use the WebdriverIO package APIs to manage sessions. The APIs can be imported using `import { remote, attach, multiremote } from 'webdriverio` and contain the following functionality:

#### `remote(options, modifier)`

Starts a WebdriverIO session. The instance contains all commands as the protocol package but with additional higher order functions, see [API docs](/docs/api).

##### Paramaters

- `options`: [WebdriverIO Options](/docs/options#webdriverio)
- `modifier`: function that allows to modify the client instance before it is being returned

##### Example

```js
import { remote } from 'webdriverio'

const browser = await remote({
    capabilities: { browserName: 'chrome' }
})
```

#### `attach(attachOptions)`

Attaches to a running WebdriverIO session.

##### Paramaters

- `attachOptions`: instance to attach a session to or at least an object with a property `sessionId` (e.g. `{ sessionId: 'xxx' }`)

##### Example

```js
import { remote, attach } from 'webdriverio'

const browser = await remote({...})
const newBrowser = await attach(browser)
```

#### `multiremote(multiremoteOptions)`

Initiates a multiremote instance which allows you to control multiple session within a single instance. Checkout our [multiremote examples](https://github.com/webdriverio/webdriverio/tree/main/examples/multiremote) for concrete use cases.

##### Paramaters

- `multiremoteOptions`: an object with keys representing the browser name and their [WebdriverIO Options](/docs/options#webdriverio).

##### Example

```js
import { multiremote } from 'webdriverio'

const matrix = await multiremote({
    myChromeBrowser: {
        capabilities: { browserName: 'chrome' }
    },
    myFirefoxBrowser: {
        capabilities: { browserName: 'firefox' }
    }
})
await matrix.url('http://json.org')
await matrix.browserA.url('https://google.com')

console.log(await matrix.getTitle())
// returns ['Google', 'JSON']
```

## The WDIO Testrunner

The main purpose of WebdriverIO, though, is end-to-end testing on a big scale. We therefore implemented a test runner that helps you to build a reliable test suite that is easy to read and maintain.

The test runner takes care of many problems that are common when working with plain automation libraries. For one, it organizes your test runs and splits up test specs so your tests can be executed with maximum concurrency. It also handles session management and provides lots of features to help you to debug problems and find errors in your tests.

Here is the same example from above, written as a test spec and executed by WDIO:

```js
describe('DuckDuckGo search', () => {
    it('searches for WebdriverIO', () => {
        browser.url('https://duckduckgo.com/')

        $('#search_form_input_homepage').setValue('WebdriverIO')
        $('#search_button_homepage').click()

        const title = browser.getTitle()
        console.log('Title is: ' + title)
        // outputs: "Title is: WebdriverIO (Software) at DuckDuckGo"
    })
})
```

The test runner is an abstraction of popular test frameworks like Mocha, Jasmine, or Cucumber. A key difference when compared with standalone mode is that all commands that executed by the WDIO test runner are synchronous. That means that you don't need promises anymore to handle async code.

To run your tests using the WDIO test runner, check out the [Getting Started](GettingStarted.md) section for more information.
