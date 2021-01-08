import { Command, flags } from '@oclif/command'
const fse = require('fs-extra')
const fs = require('fs')

export default class Cp extends Command {
  static description = '专用于复制课件基础结构和course.conf文件'

  static examples = [
    `$ l-work cp`,
  ]

  static args = [
    { name: 'sourceDict', required: true },
    { name: 'targetDict', required: true }
  ]

  async run() {
    const { args } = this.parse(Cp)
    const { sourceDict, targetDict } = args
    const newTargetFolder = targetDict.replace(/\d?$/, Math.random().toString().slice(15))
    try {
      await fse.ensureDir(newTargetFolder)
      console.log(`Created new project folder: ${newTargetFolder} ✔`);
      await fse.copy(sourceDict, newTargetFolder, {
        filter: (src: string, dest: string) => {
          if (src.endsWith('conf') || src.endsWith('json') || fs.statSync(src).isDirectory()) {
            return true;
          }
          return false;
        }
      })
      console.log('Success.init new project folder.');
    } catch (error) {
      console.log(error)
      process.exit(-1)
    }
  }
}
