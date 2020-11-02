import { Command, flags } from '@oclif/command'
const Clipboardy = require('clipboardy')
const pinyin = require('tiny-pinyin')

class Lanhu extends Command {
  static description = '只要你从蓝湖的接口复制出图片的json数据,我就把egret能接受的eui皮肤源码给你.'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const clipboardContent = Clipboardy.readSync()
    try {
      const jsonData = JSON.parse(clipboardContent)
      const mainInfo = jsonData.info.filter((item: any) => {
        return item.type === 'layerSection' && !(['kuang', 'fanhui', 'jiaoan', 'huanjie', 'chongwan', 'bjjian1', 'bjjian2', 'wenhao'].some(i => i === item.name))
      })
        .map((item: any) => {
          const pinyinName = pinyin.convertToPinyin(item.name, '', true).replace(/ /g, '')
          return {
            x: item.left,
            y: item.top,
            width: item.width,
            height: item.height,
            source: `${pinyinName}_png`,
            id: pinyinName.replace(/-/g, '_'),
            touchEnabled: false,
          }
        })
        .map((item: any) => {
          return `<e:Image source="${item.source}" id="${item.id}" touchEnabled="${item.touchEnabled}" x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" />`
        })
        .join('\n')
      Clipboardy.writeSync(mainInfo)
    } catch (error) {
      this.log(error.message)
    }
  }
}

export = Lanhu
