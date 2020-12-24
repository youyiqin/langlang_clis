import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
const path = require('path')
const fse = require('fs-extra')

class LGame extends Command {
  static description = '郎朗游戏开发脚手架: 初始化项目结构和基础文件,渐近性增加功能和api,统一风格.目前支持egret开发,不支持h5和cocos'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
  }
  static args = [
    { name: 'projectName', required: true }
  ]

  async run() {
    const { args } = this.parse(LGame)
    const currentPath = process.cwd()
    const dstPath = path.join(currentPath, args.projectName)
    if (await fse.pathExists(dstPath)) {
      console.log(`${dstPath} is exist.exit...`);
    } else {
      //mk and cd project folder
      fse.ensureDir(dstPath)
        .then(async () => {
          // copy template file and folder
          const srcDic = path.join(__dirname, 'template', 'customize')
          cli.action.start('coping...workin-hard...')
          await fse.copy(srcDic, dstPath)
          cli.action.stop()
        })
        .catch((err: any) => console.log(err));
    }
  }
}

export = LGame
