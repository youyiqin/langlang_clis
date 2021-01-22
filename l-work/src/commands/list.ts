import { Command } from '@oclif/command'
import cli from 'cli-ux'
import * as fs from 'fs'
import * as path from 'path'
const FindFiles = require('file-regex')
const fsPromise = fs.promises
import * as Colors from 'colors'
import { getCourseBasicInfo, logAndExit } from '../lib'

export default class List extends Command {
  static description = '打印和保存当前目录下的课件的基本信息.'

  static examples = [
    `$ l-work list`,
  ]

  static args = [
    { name: 'dir', default: process.cwd(), description: '默认检查目录是当前目录.' }
  ]

  async run() {
    const { args } = this.parse(List)
    const dir = path.resolve(args.dir)
    try {
      const promiseArr: Promise<{ status: boolean, url: string, title: string }>[] = []

      for (const item of await FindFiles(dir, 'course.conf', 1)) {
        const { file, dir } = item
        const content = await fsPromise.readFile(path.join(dir, file), 'utf8')
        promiseArr.push(getCourseBasicInfo(content))
      }
      if (promiseArr.length === 0) {
        // exit
        logAndExit(Colors.blue('无效的目录,不存在可检查的 course.conf 课件.'))
      }
      // promise all task
      const checkResultArr = await Promise.all(promiseArr)
      let maxTitleLength = 6
      let maxUrlLength = 20
      checkResultArr.forEach(i => {
        if (i.url.length > maxUrlLength) {
          maxUrlLength = i.url.length
        }
        if (i.title.length > maxTitleLength) {
          maxTitleLength = i.title.length
        }
      })
      cli.table(checkResultArr.sort((prev, next) => {
        if (prev.status > next.status) {
          return -1
        } else {
          return 1
        }
      }), {
        title: {
          minWidth: maxTitleLength + 4,
          get: row => Colors.blue(row.title.padEnd(maxTitleLength - row.title.length))
        },
        '构建状态': {
          minWidth: 6,
          get: row => Colors.yellow(row.status ? '✔' : '😑')
        },
        url: {
          get: row => Colors.green(row.url.padEnd(maxUrlLength - row.url.length))
        }
      })
    } catch (error) {
      console.log(Colors.blue('无效的地址: \t') + Colors.green(dir));
      console.log(Colors.yellow('错误信息: \t'), Colors.green(error.message));
    }
  }
}
