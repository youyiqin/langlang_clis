// authors: qinyouyi,hexuchao
class Help {
  // 管道,从左到右执行.只传一个参数,执行第一个函数,结果传入后续的函数.
  static pipe = (...fns) => <T>(T) => fns.reduce((acc, fn) => fn(acc), T);

  // 柯里化 将参数减少到一个
  static curry = fn => function curryFn(...args) {
    if (args.length < fn) {
      return function () {
        return curryFn.apply(null, args.concat(Array.prototype.slice.call(arguments)))
      }
    }
    return fn.apply(null, args)
  }
  // 偏函数,用undefined替代暂时不添加的函数参数,后续添加
  static partial = (fn: Function, ...partialArgs) => {
    let args = Array.of(partialArgs)
    return (...fullArgs) => {
      let argIndex = 0;
      for (let index = 0; index < args.length && argIndex < fullArgs.length; index++) {
        if (args[index] === undefined) {
          args[index] = fullArgs[argIndex++]
        }
      }
      const result = fn.apply(null, args)
      args = Array.of(...partialArgs)
      return result
    }
  }
  // 方便调用egretGameApi
  static customizeEgretApi(api: 'report' | 'openVideo', argu: any): void {
    EgretGameApi && EgretGameApi[api] && EgretGameApi[api](argu)
  }


  // 不再推荐使用隐式的改变属性方案
  // 反转图片或者帧动画的touchEnabled属性
  static reverseTargetTouchEnabled(target: eui.Image | egret.MovieClip, callbackFn?: () => void) {
    try {
      target.touchEnabled = !target.touchEnabled
      callbackFn && callbackFn()
    } catch (error) {
      throw Error(error.message || `转换${target}属性失败.`)
    } finally {
      return target
    }
  }
  // 显示指定touchEnabled或者visiable
  static enabled(target: egret.DisplayObject, attr: 'touchEnabled' | 'visible') {
    target[`${attr}`] = true
  }
  static disenabled(target: egret.DisplayObject, attr: 'touchEnabled' | 'visible') {
    target[`${attr}`] = false
  }
  // 缩放图片或者帧动画,提供一个默认实现,也可以传参数进行自定义
  static zoomIt(target: egret.DisplayObject, attr?: {
    size: number
    time: number,
    style: Function,
  }, cb?: Function) {
    if (attr !== undefined) {
      const { size, time, style } = attr
      return egret.Tween
        .get(target)
        .to({
          scaleX: size,
          scaleY: size
        }, time, style)
        .call(() => {
          cb && cb()
        })
    } else {
      // 默认缩放
      return egret.Tween
        .get(target)
        .to({
          scaleX: 1.2,
          scaleY: 1.2
        }, 800, egret.Ease.sineInOut)
        .to({
          scaleX: 1,
          scaleY: 1
        }, 800, egret.Ease.sineIn)
        .call(() => {
          cb && cb()
        })
    }
  }

  // 设置图片或者帧动画的锚点到物体的中心,方便原地缩放和旋转等等操作.
  static setCenterAnchorOffset(target: egret.DisplayObject) {
    target.anchorOffsetX = target.width / 2;
    target.x += target.width / 2;
    target.anchorOffsetY = target.height / 2;
    target.y += target.height / 2;
  }
  // 例如图片有 tu1~tu10
  // 可以 rangeOnTarget(this, 10, 'tu', 1) 得到 [tu1, tu2....tu10] 的数组
  static rangeOnTarget(target: any, length: number, keyword: string, from: number = 0) {
    return Array.from({ length }, (_, i) => target[`${keyword}${i + from}`])
  }

  // 图片本地缩放过度,然后旋转缩小消失,闪烁到新的位置旋转恢复
  static flashAndRotating(target: eui.Image, dstX: number, dstY: number, time = 333, scale = 0, rotation = 1080, callbackFn?: Function) {
    egret.Tween.get(target)
      .to({
        scaleX: 0.85,
        scaleY: 0.85
      }, 333, egret.Ease.sineOut)
      .to({
        scaleX: 1.2,
        scaleY: 1.2
      }, 333, egret.Ease.sineIn)
      .wait(300)
      .to({
        scaleX: scale,
        scaleY: scale,
        rotation,
      }, time, egret.Ease.sineInOut)
      .to({
        x: dstX,
        y: dstY
      })
      .to({
        scaleX: 1,
        scaleY: 1,
        rotation
      }, time, egret.Ease.sineOut)
      .call(() => {
        callbackFn && callbackFn()
      })
  }
}
