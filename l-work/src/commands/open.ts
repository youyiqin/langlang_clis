import { Command } from '@oclif/command'
import cli from 'cli-ux'
import axios from 'axios'
const fs = require('fs')
const path = require('path')

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
    let targetType;
    if (fs.existsSync(path.join(targetPath, 'course.conf'))) {
      // 课件
      // http://s.langlangyun.com/c/index.html?name=clbsx4_huawenduiying2242#/lesson-1-1
      const content = fs.readFileSync(path.join(targetPath, 'course.conf'), 'utf8')
      const courseNameIndex = content.indexOf('course_name=')
      if (courseNameIndex === -1) {
        console.log('无效的配置文件: course.conf.')
        process.exit()
      }
      const courseName = content
        .slice(courseNameIndex, courseNameIndex + 100)
        .split('\r\n')[0]
        .replace(/^.*=/, '')
      const url = `http://s.langlangyun.com/c/index.html?name=${courseName}`
      const statusUrl = `http://s.langlangyun.com/static/${courseName}s/course.json`
      axios.get(statusUrl).then(response => {
        if (response.status === 200) cli.open(url)
        else {
          console.log('异常, 响应为:', response?.data ?? '空');
        }
      }).catch(_ => {
        console.log('暂未构建线上地址.');
        process.exit()
      })
      // cli.open(url)
    } else if (fs.existsSync(path.join(targetPath, 'course.json'))) {
      // 游戏,查询本地数据库,不存在则发起web查询,查到则更新本地数据库数据,否则返回失败
    } else {
      console.log('无效的目标目录.');
      process.exit()
    }
  }
}
