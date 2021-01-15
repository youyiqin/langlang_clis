class GameUtil {
  /**
   * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
   * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
   */
  static channelList: Array<egret.SoundChannel> = [];
  static createBitmapByName(name: string) {
    let result = new egret.Bitmap();
    let texture: egret.Texture = RES.getRes(name);
    result.texture = texture;
    return result;
  }

  // 播放声音
  static playSound(sound: string, isClearChannelList?: boolean, isLoop?: false) {
    let playSound: egret.Sound = RES.getRes(sound);
    isClearChannelList && GameUtil.clearChannel();
    let channel: egret.SoundChannel = playSound.play(0, isLoop ? -1 : 1);
    GameUtil.channelList.push(channel);
    return channel
  }
  // 动画
  static initGif(param: {
    json: string, img: string, x: number, y: number, playName?: string, name?: string
  }) {
    const data = RES.getRes(param.json);
    const txtr = RES.getRes(param.img);
    let mcFanctory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(data, txtr);
    const obj = new egret.MovieClip(mcFanctory.generateMovieClipData(param.playName));
    // 动画的位置
    obj.x = param.x || 0;
    obj.y = param.y || 0;
    obj.name = param.name || "";
    return obj;
  }
  // 滤镜
  static setFilter(color: number, alpha: number) {
    const blurX: number = 45;
    const blurY: number = 45;
    const strength: number = 3;
    const quality: number = egret.BitmapFilterQuality.HIGH;
    const inner: boolean = false;
    const knockout: boolean = false;
    const glowFilter: egret.GlowFilter = new egret.GlowFilter(color, alpha, blurX, blurY, strength, quality, inner, knockout);
    return glowFilter;
  }
  // 遮罩
  static setMask(alpha: number = 0.4, width: number = 1920, height: number = 1080) {
    const mask: egret.Shape = new egret.Shape();
    mask.graphics.beginFill(0xffffff, 0.4);
    mask.graphics.drawRect(0, 0, 1920, 1080);
    mask.graphics.endFill();
    return mask;
  }
  // 画圆
  static setCircle(target, imgName: string) {
    const offsetX = target.x + target.width / 2;
    const offsetY = target.y + target.height / 2;
    // 图片的名称
    const cricleObj = this.createBitmapByName(imgName);
    cricleObj.anchorOffsetX = cricleObj.width / 2;
    cricleObj.anchorOffsetY = cricleObj.height / 2;
    cricleObj.x = offsetX;
    cricleObj.y = offsetY;
    return cricleObj;
  }
  /**
   * 检测碰撞矩形
   * @objA 对象A
   * @objB 对象B
   *
   * 适用范围： 1.矩形，不一定是eui对象
   *
   *           2. 对象旋转了无法碰撞检测
   *
   *           3.对象修改了锚点也可以正确检测到
   */
  static checkRect(objA: egret.DisplayObject, objB: egret.DisplayObject) {
    var x1 = objA.x - objA.anchorOffsetX;
    var y1 = objA.y - objA.anchorOffsetY;
    var x2 = objB.x - objB.anchorOffsetX;
    var y2 = objB.y - objB.anchorOffsetY;

    if (y1 > (y2 - objA.height) && y1 < (y2 + objB.height)) {
      if (x1 > (x2 - objA.width) && x1 < (x2 + objB.width)) {
        return true;
      }
    }
    return false;
  }
  /**
   * 检测碰撞矩形egret api
   * @objA 对象A
   * @objB 对象B
   *
   * 适用范围： 1.矩形，一定是eui对象
   *
   *           2. 对象旋转了无法碰撞检测
   *
   *           3.对象修改了锚点也可以正确检测到
   */
  static checkRectTwo(objA: eui.Image, objB: eui.Image) {
    // 当前移动对象的位置信息
    let rect1: egret.Rectangle = objA.getBounds();
    rect1.x = objA.x;
    rect1.y = objA.y;

    // 等待匹配对象的位置信息
    let rect2: egret.Rectangle = objB.getBounds();
    rect2.x = objB.x;
    rect2.y = objB.y;

    return rect2.intersects(rect1);
  }
  // 清空所有的音频
  static clearChannel() {
    GameUtil.channelList.forEach(channelItem => {
      if (channelItem) {
        channelItem.stop();
        channelItem = null;
      }
    });
    GameUtil.channelList = [];
  }
}
