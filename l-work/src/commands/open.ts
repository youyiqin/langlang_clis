import { Command } from '@oclif/command'
import cli from 'cli-ux'
import axios from 'axios'
import { logAndExit, getCertificate } from '../lib/'
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
    // 指定一个目录,默认当前目录
    const targetPath = path.resolve(args.path.startsWith('.\\') ? path.join(process.cwd(), args.path) : args.path)

    // 直接在数据库中查询看看
    const dbData = db.get('paths').value()
    let targetUrl;
    dbData.forEach(async (item: any) => {
      if (item[targetPath]) {
        // await cli.open(item[targetPath])
        // logAndExit('kai')
        targetUrl = item[targetPath]
      }
    })
    // await cli.wait(5000)
    targetUrl && await cli.open(targetUrl) && process.exit()

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
        .split('\n')[0]
        .replace(/^.*=/, '')
        .replace('\r', '')
      const url = `http://s.langlangyun.com/${courseName}/index.html`
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
        logAndExit(`${_.message}, 暂未构建.`)
      })
      // cli.open(url)
    } else if (fs.existsSync(path.join(targetPath, 'course.json'))) {
      try {
        // 获取cookie
        const certificate = getCertificate('kejian');
        // 读取配置文件信息
        const courseJson = JSON.parse(fs.readFileSync(path.join(targetPath, 'course.json'), 'utf8'));

        // 三种类型一起查了,得到promise array
        const tasksArr = ['egret', 'cocos', 'h5'].map(async (typeItem: string) => {
          // 查询地址
          const url = `http://kejian.suboy.cn/cgi/auth/build/${typeItem}/stored`
          return new Promise((resolve) => {
            axios.post(url, {
              searchKey: courseJson.course ? courseJson.course : (logAndExit('无效的course.json配置'))
            }, {
              headers: { 'Content-Type': 'application/json', cookie: certificate.certificate }
            }).then(response => {
              if (response.data.code === 0 && response.data.data !== undefined) {
                resolve(response.data.data.map((item: any) => {
                  item['type'] = typeItem
                  return item
                }))
              } else {
                logAndExit(response.data.message ?? 'Unknown, 也许是cookie过期.')
              }
            }).catch(err => {
              logAndExit(err.message)
            })
          })
        })

        // 查到则更新本地数据库数据,否则返回失败
        let resultArr: any[] = []
        Promise.all(tasksArr).then(result => {
          result.filter((item: any) => item.length > 0).forEach((item: any) => {
            item.forEach((i: any) => resultArr.push(i))
          })
        }).then(async (_) => {
          if (resultArr.length === 1) {
            const url = `http://s.langlangyun.com/c/index.html?${resultArr[0]['type']}=${resultArr[0]['hash_name']}`
            // 写入数据库
            if (db.get('paths').find({ [targetPath]: url }).value() === undefined) {
              db
                .get('paths')
                .push({
                  [targetPath]: url
                })
                .write()
            }
            // open browser
            await cli.open(url)
          } else {
            console.log('具有多个类型的同名游戏:', resultArr);
            cli.table(resultArr, {
              type: {
                minWidth: 12,
                get: row => row.type ?? 'unknown'
              },
              url: {
                get: row => `http://s.langlangyun.com/c/index.html?${row['type']}=${row['hash_name']}`
              }
            })
          }
        }).catch(err => {
          logAndExit(err.message)
        })
        // logAndExit('out')
      } catch (error) {
        logAndExit(error.message)
      }
    } else {
      logAndExit('无效的目标目录')
    }
  }
}
