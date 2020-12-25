//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
declare let EgretGameApi: any;
class Main extends eui.UILayer {


  protected createChildren(): void {
    super.createChildren();

    egret.lifecycle.addLifecycleListener((context) => {
      // custom lifecycle plugin
    })

    // egret.lifecycle.onPause = () => {
    //     egret.ticker.pause();
    // }

    // egret.lifecycle.onResume = () => {
    //     egret.ticker.resume();
    // }

    //inject the custom material
    //注入自定义的素材解析器
    let assetAdapter = new AssetAdapter();
    egret.registerImplementation("eui.IAssetAdapter", assetAdapter);
    egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());
    EgretGameApi.basePath = EgretGameApi.basePath || ''

    this.runGame().catch(e => {
      console.log(e);
    })
  }

  private async runGame() {
    await this.loadResource();
    this.createGameScene();
  }

  private async loadResource() {
    try {
      const loadingView = new LoadingUI();
      this.stage.addChild(loadingView);
      await RES.loadConfig(EgretGameApi.basePath + "resource/default.res.json", EgretGameApi.basePath + "resource/");
      await this.loadTheme();
      await RES.loadGroup("preload", 0, loadingView);
      this.stage.removeChild(loadingView);
    }
    catch (e) {
      console.error(e);
    }
  }

  private loadTheme() {
    return new Promise((resolve, reject) => {
      // load skin theme configuration file, you can manually modify the file. And replace the default skin.
      //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
      let theme = new eui.Theme("resource/default.thm.json", this.stage);
      theme.addEventListener(eui.UIEvent.COMPLETE, () => {
        resolve();
      }, this);

    })
  }
  /**
   * 创建场景界面
   * Create scene interface
   */
  protected createGameScene(): void {
    const root = this
    // 场景
    SceneManager.Instance.rootLayer = this; // 将this 定为起始场景
    const game = new Game();
    SceneManager.Instance.changeScene(game);

    function reset() {
      // 移除事件
      EventManager.removeEvent("reset", this.resetGame, root);
      // 移除音频 解决：第一次移除之后无法播放提示音的问题
      GameUtil.clearChannel();
      // 移除页面的元素
      while (root.numChildren > 0) {
        const item = root.removeChildAt(0);
        typeof item["Dispose"] == "function" && item["Dispose"]();
      }
      // 移除所有的动画
      egret.Tween.removeAllTweens();
      // 重新加载界面
      root.createGameScene();
    }

    // 派发一个事件
    // EgretGameApi.reset = () => {
    //   EventManager.emitEvent("reset");
    // }
    // 侦听这个事件
    EventManager.onEvent("reset", reset, this);
    EgretGameApi.reset = reset
  }
}
