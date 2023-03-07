module.exports = class InterceptorManager {
  constructor() {
    this.handles = [];
  }

  use(handle) {
    let interceptor = handle;
    if (typeof handle === 'function') {
      interceptor = {};
      interceptor.fulfilled = handle;
    }
    this.handles.push(interceptor);

    return handle;
  }

  clear() {
    this.handles = [];
  }

  size() {
    return this.handles.length;
  }

  get(idx) {
    return this.handles[i];
  }

  eject(handle) {
    const idx = this.handles.findIndex((i) => {
      if (typeof handle === 'function' && handle === i.fulfilled) return true;
      if (typeof handle === 'object' &&
        (handle === i || (handle.fulfilled === i.fulfilled && handle.rejected === i.rejected))) return true;
      return false;
    });
    this.handles.splice(idx, 1);
  }
}