const Module = require('module');
const path = require('path');

const originalResolveFilename = Module._resolveFilename;
const polyfillsShimPath = path.join(__dirname, 'react-native-rn-get-polyfills.js');

Module._resolveFilename = function resolveExpoReactNativePolyfills(
  request,
  parent,
  isMain,
  options,
) {
  if (request === 'react-native/rn-get-polyfills') {
    return polyfillsShimPath;
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
