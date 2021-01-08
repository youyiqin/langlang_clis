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

  // 缓动动画简单封装
  static tween(target: any, options: Object, toObj: Object, duration: number, ease: (number) => number, callbackFn?: Function) {
    egret.Tween.get(target, options)
      .to(toObj, duration, ease).call(() => {
        callbackFn && callbackFn()
      })
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
  static disEnabled(target: egret.DisplayObject, attr: 'touchEnabled' | 'visible') {
    target[`${attr}`] = false
  }
  // 缩放图片或者帧动画,提供一个默认实现,也可以传参数进行自定义
  static zoomIt(target: egret.DisplayObject, loop = false, attr?: {
    size: number
    time: number,
    style: Function,
  }, cb?: Function) {
    if (attr !== undefined) {
      const { size, time, style } = attr
      return egret.Tween
        .get(target, { loop })
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
  static rangeOnTarget(target: any, length: number, keyword: string, from: number = 0): any[] {
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
  /**
   * 拖拽事件 按下 移动 抬起
   * 注意：target的类型被规定为了eui.Image，后期可以根据需求更改数据类型
   * 使用此属性,必须手动绑定 stage 对象为this
   */
  static dragEvent(target: egret.DisplayObject | eui.Image, root: any, topParentDisplayObj: any, mouseUpCallback?: Function): void {

    // 可以点击的属性
    target.touchEnabled = true;
    // 高频绘制的控制flag
    let scheduledAnimationFrame: Boolean = false;
    target.addEventListener(egret.TouchEvent.TOUCH_BEGIN, mouseDown, root);
    // 抬起
    target.addEventListener(egret.TouchEvent.TOUCH_END, mouseUp, root);
    // 当鼠标不在当前目标对象身上时，松开手指时触发
    target.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, mouseUp, root);

    function mouseDown(evt: egret.TouchEvent): void {
      // 设置层级：当前拖拽的元素为最高级
      topParentDisplayObj.setChildIndex(target, topParentDisplayObj.numChildren - 1);
      root._distance.x = evt.stageX - target.x;
      root._distance.y = evt.stageY - target.y;
      // 移动
      root.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, mouseMove, root);
    }

    function mouseMove(evt: egret.TouchEvent): void {
      if (scheduledAnimationFrame) return
      scheduledAnimationFrame = true
      // 获取到拖拽元素的位置信息
      let moveX = evt.stageX - root._distance.x;
      let moveY = evt.stageY - root._distance.y;
      // 拖拽临界点的考虑
      if (moveX < 0) {
        moveX = 0;
      } else if (moveX > root.stage.stageWidth - target.width) {
        moveX = root.stage.stageWidth - target.width;
      }
      if (moveY < 0) {
        moveY = 0;
      } else if (moveY > root.stage.stageHeight - target.height) {
        moveY = root.stage.stageHeight - target.height;
      }
      // 处理：高频事件下，防止重复绘制
      // 回调函数会在浏览器刷新重绘之前执行,并且设置 scheduledAnimationFrame 为 false,防止mouseMove函数频繁执行.
      window.requestAnimationFrame(() => {
        scheduledAnimationFrame = false;
        target.x = moveX;
        target.y = moveY;
      });
    }

    function mouseUp(evt: egret.TouchEvent): void {
      root.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, mouseMove, root);
      // 抬起时，碰撞检测
      mouseUpCallback && mouseUpCallback()
    }
  }

  // 常用帧动画,传一个父级对象,用于 addChild ,最终返回此帧动画对象,默认 visible = false
  static initGif(basicFrameInfoObj: { json: string, img: string, x: number, y: number }, parentDisplayObj: any, completeCbFn?: Function, isOnce?: boolean): egret.MovieClip {
    const Gif = GameUtil.initGif(basicFrameInfoObj)
    parentDisplayObj.addChild(Gif)
    Help.disEnabled(Gif, 'visible')
    if (completeCbFn) {
      if (isOnce) {
        Gif.once(egret.Event.COMPLETE, completeCbFn, false)
      } else {
        Gif.addEventListener(egret.Event.COMPLETE, completeCbFn, false)
      }
    }
    return Gif
  }

  static initGxggGif(parentDisplayObj: any, completeCbFn?: Function, isOnce?: boolean): egret.MovieClip {
    return Help.initGif({
      json: 'gxgg2_json',
      img: 'gxgg2_png',
      x: 350,
      y: 25
    }, parentDisplayObj, completeCbFn, isOnce)
  }

  static initRegretGif(parentDisplayObj: any, completeCbFn?: Function, isOnce?: boolean): egret.MovieClip {
    return Help.initGif({
      json: "henyihan_json",
      img: "henyihan_png",
      x: 520,
      y: 100,
    }, parentDisplayObj, completeCbFn, isOnce)
  }
}
