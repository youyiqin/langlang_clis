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
  static reverseTargetTouchEnabled(target: eui.Image | egret.MovieClip, callbackFn?: () => void) {
    try {
      target.touchEnabled = !target.touchEnabled
      callbackFn && callbackFn()
    } catch (error) {
      throw Error(error.message || `转换${target}属性失败.`)
    }
  }

  static setCenterAnchorOffset(target: eui.Image | egret.MovieClip | egret.Shape) {
    target.anchorOffsetX = target.width / 2;
    target.x += target.width / 2;
    target.anchorOffsetY = target.height / 2;
    target.y += target.height / 2;
  }
}