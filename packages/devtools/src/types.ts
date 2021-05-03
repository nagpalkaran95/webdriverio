import type { Capabilities } from '@wdio/types'
import { LaunchOptions, BrowserLaunchArgumentOptions, BrowserConnectOptions, ConnectOptions } from 'puppeteer-core'

export interface ExtendedCapabilities extends Capabilities.Capabilities, WDIODevtoolsOptions {}

export interface WDIODevtoolsOptions {
    'wdio:devtoolsOptions'?: DevToolsOptions
}

export interface DevToolsOptions extends LaunchOptions, BrowserLaunchArgumentOptions, BrowserConnectOptions, ConnectOptions {
    /**
     * If you want to start Google Chrome on a custom port
     */
    customPort?: number
}

export interface AttachOptions {
    capabilities: {
        'goog:chromeOptions': {
            debuggerAddress: string
        }
    } | {
        'ms:edgeOptions': {
            debuggerAddress: string
        }
    }
}
