class Flow {
  constructor(scope, data) {
    this.data = data;
    this.scope = scope;
  }
  async pipe(fn, ...args) {
    if (fn instanceof Method) fn = fn.get(this.data);
    if (!fn.isClioFn) fn = new Fn(fn, null, IO, { scoped: false });
    const data = await fn(this.data, ...args);
    return new Flow(this.scope, data);
  }
  async map(fn, ...args) {
    const map = fn.isLazy ? this.data.lazyMap : this.data.map;
    const data = await map.call(this.data, item => {
      let fun = fn instanceof Method ? fn.get(this.data) : fn;
      if (!fun.isClioFn) fun = new Fn(fun, null, IO, { scoped: false });
      return fun(item, ...args);
    });
    return new Flow(this.scope, data);
  }
  async set(key) {
    if (key.includes(".")) {
      const [first, ...rest] = key.split(".");
      const last = rest.pop();
      let object = this.scope.$[first];
      while (rest.length) object = object[rest.shift()];
      object[last] = this.data;
    } else {
      this.scope.$[key] = this.data;
    }
    return this;
  }
  valueOf() {
    return this.data.valueOf();
  }
}

const flow = (scope, data) => new Flow(scope, data);

module.exports.flow = flow;
module.exports.Flow = Flow;

const { Method } = require("./method");
const { Fn } = require("./functions");
const { IO } = require("./io");
