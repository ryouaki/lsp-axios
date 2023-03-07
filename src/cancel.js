module.exports = class CancelToken {
  constructor(exec) {
    this.exec = exec;
  }

  subscribe (fb) {
    this.abort = fb;
  }

  unsubscribe() {
    this.abort = null; // 释放引用。
  }

  abort () {
    this.abort();
    this.unsubscribe();
  }
}