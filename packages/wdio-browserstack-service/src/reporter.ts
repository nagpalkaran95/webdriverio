import WDIOReporter, { SuiteStats, TestStats, RunnerStats } from '@wdio/reporter'
import type { Capabilities, Options } from '@wdio/types'

import { v4 as uuidv4 } from 'uuid'
import { Browser, MultiRemoteBrowser } from 'webdriverio'

import { BrowserstackConfig, TestData } from './types'
import { getCloudProvider, uploadEventData, getHierarchy } from './util'
import RequestQueueHandler from './request-handler'

export default class TestReporter extends WDIOReporter {
    private _capabilities: Capabilities.Capabilities = {}
    private _config?: BrowserstackConfig & Options.Testrunner
    private _observability = true
    private _sessionId?: string
    private _suiteName?: string
    private _requestQueueHandler = RequestQueueHandler.getInstance()

    onRunnerStart (runnerStats: RunnerStats) {
        this._capabilities = runnerStats.capabilities as Capabilities.Capabilities
        this._config = runnerStats.config as BrowserstackConfig & Options.Testrunner
        this._sessionId = runnerStats.sessionId
        /* istanbul ignore next */
        if (this._config.testObservability == false) this._observability = false
    }

    onSuiteStart (suiteStats: SuiteStats) {
        this._suiteName = suiteStats.file
    }

    async onTestSkip (testStats: TestStats) {
        // cucumber steps call this method. We don't want step skipped state so skip for cucumber

        /* istanbul ignore next */
        const framework = this._config?.framework

        if (this._observability && framework != 'cucumber') {
            let testData: TestData = {
                uuid: uuidv4(),
                type: testStats.type,
                name: testStats.title,
                body: {
                    lang: 'webdriverio',
                    code: null
                },
                scope: testStats.fullTitle,
                scopes: getHierarchy(testStats.fullTitle),
                identifier: testStats.fullTitle,
                file_name: this._suiteName,
                location: this._suiteName,
                started_at: (new Date()).toISOString(),
                framework: framework,
                finished_at: (new Date()).toISOString(),
                duration_in_ms: testStats._duration,
                retries: { limit:0, attempts: 0 },
                result: testStats.state,
            }

            /* istanbul ignore next */
            const cloudProvider = getCloudProvider({ options: { hostname: this._config?.hostname } } as Browser<'async'> | MultiRemoteBrowser<'async'>)
            testData.integrations = {}

            /* istanbul ignore next */
            testData.integrations[cloudProvider] = {
                capabilities: this._capabilities,
                session_id: this._sessionId,
                browser: this._capabilities?.browserName,
                browser_version: this._capabilities?.browserVersion,
                platform: this._capabilities?.platformName,
            }

            const uploadData = {
                event_type: 'TestRunFinished',
                test_run: testData
            }

            const req = this._requestQueueHandler.add(uploadData)
            if (req.proceed && req.data) {
                await uploadEventData(req.data, req.url)
            }
        }
    }
}
