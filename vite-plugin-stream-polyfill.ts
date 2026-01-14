import type { Plugin } from 'vite';

/**
 * Vite plugin to polyfill Node.js 'stream' module
 * This prevents "Cannot find module 'stream'" errors in the browser
 */
export function streamPolyfill(): Plugin {
  const virtualModuleId = '\0stream-polyfill';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'stream-polyfill',
    enforce: 'pre', // Run before other plugins
    resolveId(id) {
      // Intercept all possible stream imports
      if (id === 'stream' || id === 'node:stream') {
        return virtualModuleId;
      }
      return null;
    },
    load(id) {
      // Return the polyfill when the virtual module is loaded
      if (id === virtualModuleId) {
        return `
// Polyfill for Node.js stream module in browser
// This prevents "Cannot find module 'stream'" errors during runtime

// Create a minimal Stream class
class Stream {
  constructor() {
    // Empty implementation for browser compatibility
  }
  
  // Add minimal methods that might be called
  pipe() { return this; }
  on() { return this; }
  emit() { return this; }
  end() { return this; }
  write() { return true; }
  read() { return null; }
}

// Export all stream types as the same class
const Readable = Stream;
const Writable = Stream;
const Transform = Stream;
const Duplex = Stream;
const PassThrough = Stream;

// Export as ES module
export default Stream;
export { Readable, Writable, Transform, Duplex, PassThrough };
`;
      }
      return null;
    },
    // Also handle optimizeDeps to prevent stream from being optimized
    configResolved(config) {
      // Ensure stream is excluded from optimization
      if (!config.optimizeDeps.exclude) {
        config.optimizeDeps.exclude = [];
      }
      if (!config.optimizeDeps.exclude.includes('stream')) {
        config.optimizeDeps.exclude.push('stream');
      }
    },
  };
}
