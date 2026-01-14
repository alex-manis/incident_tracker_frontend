// Polyfill for Node.js stream module in browser
// This provides a minimal implementation to prevent "Cannot find module 'stream'" errors

class Stream {
  constructor() {
    // Empty implementation for browser compatibility
  }
}

// Export as both default and named exports to support different import styles
const Readable = Stream;
const Writable = Stream;
const Transform = Stream;
const Duplex = Stream;
const PassThrough = Stream;

export default Stream;
export { Readable, Writable, Transform, Duplex, PassThrough };

// Also support CommonJS style exports for compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Stream;
  module.exports.Readable = Readable;
  module.exports.Writable = Writable;
  module.exports.Transform = Transform;
  module.exports.Duplex = Duplex;
  module.exports.PassThrough = PassThrough;
}
