/**
 * Determine if the current instance is a Unified Platform instance
 * @param {string} deviceName
 * @param {string} platformName
 * @returns {boolean}
 *
 * This is what we get back from the UP (for now)
 *
 * capabilities =  {
 *  webStorageEnabled: false,
 *  locationContextEnabled: false,
 *  browserName: 'safari',
 *  platform: 'MAC',
 *  javascriptEnabled: true,
 *  databaseEnabled: false,
 *  takesScreenshot: true,
 *  networkConnectionEnabled: false,
 *  platformVersion: '12.1.2',
 *  webDriverAgentUrl: 'http://127.0.0.1:5700',
 *  testobject_platform_name: 'iOS',
 *  orientation: 'PORTRAIT',
 *  realDevice: true,
 *  build: 'Sauce Real Device browser iOS - 1594732389756',
 *  commandTimeouts: { default: 60000 },
 *  testobject_device: 'iPhone_XS_ws',
 *  automationName: 'XCUITest',
 *  platformName: 'iOS',
 *  udid: '',
 *  deviceName: '',
 *  testobject_test_report_api_url: '',
 *  testobject_test_report_url: '',
 *  testobject_user_id: 'wim.selles',
 *  testobject_project_id: 'saucelabs-default',
 *  testobject_test_report_id: 51,
 *  testobject_device_name: 'iPhone XS',
 *  testobject_device_session_id: '',
 *  deviceContextId: ''
 * }
 */
export function isUnifiedPlatform({ deviceName = '', platformName = '' }){
    // If the string contains `simulator` or `emulator` it's a EMU/SIM session
    return !deviceName.match(/(simulator)|(emulator)/gi) && !!platformName.match(/(ios)|(android)/gi)
}
