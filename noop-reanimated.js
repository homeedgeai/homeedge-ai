// noop-reanimated.js
// Prevents Reanimated from crashing the Drawer while leaving it active elsewhere

module.exports = new Proxy(
  {},
  {
    get() {
      return () => {}; // no-op for all Reanimated drawer calls
    },
  }
);
