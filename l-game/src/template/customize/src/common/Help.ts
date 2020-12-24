class Help {
  static pipe = (...fns) => v => fns.reduce((acc, fn) => fn(acc), v);

  static curry = fn => function curryFn(...args) {
    if (args.length < fn) {
      return function () {
        return curryFn.apply(null, args.concat(Array.prototype.slice.call(arguments)))
      }
    }
    return fn.apply(null, args)
  }
  static customizeEgretApi(api: 'report' | 'openVideo', argu: any): void {
    EgretGameApi && EgretGameApi[api] && EgretGameApi[api](argu)
  }
}