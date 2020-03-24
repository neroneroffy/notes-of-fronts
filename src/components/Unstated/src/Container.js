export class Container {
  constructor() {
    CONTAINER_DEBUG_CALLBACKS.forEach(cb => cb(this));
    this.state = null;
    this.listeners = [];
  }

  setState(updater, callback) {
    return Promise.resolve().then(() => {
      let nextState = null;
      if (typeof updater === 'function') {
        nextState = updater(this.state);
      } else {
        nextState = updater;
      }

      if (nextState === null) {
        callback && callback();
      }
      // 返回一个新的state
      this.state = Object.assign({}, this.state, nextState);
      // 执行listener，也就是Subscribe的onUpdate函数，用来强制刷新视图
      const promises = this.listeners.map(listener => listener());

      return Promise.all(promises).then(() => {
        if (callback) {
          return callback();
        }
      });
    });
  }

  subscribe(fn) {
    this.listeners.push(fn);
  }

  unsubscribe(fn) {
    this.listeners = this.listeners.filter(f => f !== fn);
  }
}
