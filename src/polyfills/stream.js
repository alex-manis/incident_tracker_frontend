// Polyfill for stream module in browser
// This is needed because some dependencies may try to use Node.js stream module
export default class Stream {
  constructor() {
    // Empty implementation
  }
}

export const Readable = Stream;
export const Writable = Stream;
export const Transform = Stream;
export const Duplex = Stream;
