// MSW runs in Node; Expo Router's URL polyfill is intended for the mobile runtime.
const { URL, URLSearchParams } = require('node:url');
globalThis.URL = URL;
globalThis.URLSearchParams = URLSearchParams;
