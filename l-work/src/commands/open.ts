import { Command } from '@oclif/command'
import cli from 'cli-ux'
import axios from 'axios'
import { logAndExit } from '../lib/'
const fs = require('fs')
const path = require('path')
const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(path.join(process.env.HOME, 'langlang_db.json'))
const db = lowdb(adapter)

// set default content
db.defaults({
  paths: []
}).write()

export default class Build extends Command {
  static description = '打开当前目录或者指定目录的项目线上地址,课件或者游戏皆可.'

  static examples = [
    `$ l-work open [path]`,
  ]

  static args = [
    { name: 'path', default: process.cwd(), description: '默认为当前目录,可以指定一个目录.' }
  ]

  async run() {
    const { args } = this.parse(Build)
    const targetPath = path.resolve(args.path)

    // 直接在数据库中查询看看
    const dbData = db.get('paths').value()

    dbData.forEach(async (item: any) => {
      if (item[targetPath]) {
        await cli.open('https://www.baidu.com')
      }
    })

    if (fs.existsSync(path.join(targetPath, 'course.conf'))) {
      // 课件
      // http://s.langlangyun.com/c/index.html?name=clbsx4_huawenduiying2242#/lesson-1-1
      const content = fs.readFileSync(path.join(targetPath, 'course.conf'), 'utf8')
      const courseNameIndex = content.indexOf('course_name=')
      if (courseNameIndex === -1) {
        logAndExit('无效的配置文件: course.conf.')
      }
      const courseName = content
        .slice(courseNameIndex, courseNameIndex + 100)
        .split('\r\n')[0]
        .replace(/^.*=/, '')
      const url = `http://s.langlangyun.com/c/index.html?name=${courseName}`
      const statusUrl = `http://s.langlangyun.com/static/${courseName}/course.json`
      axios.get(statusUrl).then(async (response) => {
        if (response.status === 200) {
          // 保存到数据库再打开地址
          db
            .get('paths')
            .push({
              [targetPath]: url
            })
            .write()
          await cli.open(url)
        }
        else {
          logAndExit('异常, 响应为:' + response?.data ?? '空');
        }
      }).catch(_ => {
        logAndExit('暂未构建线上地址')
      })
      // cli.open(url)
    } else if (fs.existsSync(path.join(targetPath, 'course.json'))) {
      // 发起web查询,查到则更新本地数据库数据,否则返回失败
      axios.get('http://kejian.suboy.cn')
    } else {
      logAndExit('无效的目标目录')
    }
  }
}
