import type { Plugin } from 'vite';

/**
 * Vite plugin to polyfill Node.js 'stream' module
 * This prevents "Cannot find module 'stream'" errors in the browser
 */
export function streamPolyfill(): Plugin {
  return {
    name: 'stream-polyfill',
    enforce: 'pre',
    resolveId(id, importer) {
      // Intercept imports of 'stream' or 'node:stream'
      if (id === 'stream' || id === 'node:stream') {
        return '\0stream-polyfill';
      }
      // Also handle relative imports that might resolve to stream
      if (id.includes('stream') && !id.startsWith('.') && !id.startsWith('/')) {
        // Check if it's trying to import stream module
        const parts = id.split('/');
        if (parts[0] === 'stream' || parts[0] === 'node:stream') {
          return '\0stream-polyfill';
        }
      }
      return null;
    },
    load(id) {
      // Return the polyfill when the virtual module is loaded
      if (id === '\0stream-polyfill') {
        return `
// Polyfill for Node.js stream module in browser
// This prevents "Cannot find module 'stream'" errors
class Stream {
  constructor() {
    // Empty implementation for browser compatibility
  }
}

const Readable = Stream;
const Writable = Stream;
const Transform = Stream;
const Duplex = Stream;
const PassThrough = Stream;

// Export as both default and named exports
export default Stream;
export { Readable, Writable, Transform, Duplex, PassThrough };
`;
      }
      return null;
    },
  };
}
