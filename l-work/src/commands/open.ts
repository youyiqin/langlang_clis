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
                resolve([])
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
            await cli.open(`http://s.langlangyun.com/c/index.html?${resultArr[0]['type']}=${resultArr[0]['hash_name']}`)
          } else {
            console.log('具有多个类型的同名游戏:');
            cli.table(resultArr, {
              type: {
                minWidth: 12,
                get: row => row.type ?? 'unknown'
              },
              url: {
                get: row => `http://s.langlangyun.com/c/index.html?${row['type']}=${row['hash_name']`
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
