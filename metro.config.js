const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite lädt auf Web eine WASM-Datei (wa-sqlite) als Asset.
config.resolver.assetExts.push('wasm');

// COEP/COOP-Header werden für SharedArrayBuffer (wa-sqlite) im Web-Dev-Server benötigt.
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
