/* eslint-disable indent */
import { Command } from '@oclif/command'
import * as fs from 'fs'
import * as path from 'path'
const Toml = require('@ltd/j-toml')

class LTable extends Command {
  static description = 'describe the command here'

  static args = [{ name: 'basicDirectory', required: false, default: '.' }]

  async run() {
    const { args } = this.parse(LTable)
    const basicDirectory = args.basicDirectory
    let r = ''
    if (!fs.existsSync(basicDirectory)) {
      throw new Error('不存在此目录地址')
    }
    const configFileFullPathArr = fs.readdirSync(basicDirectory).filter(dir => fs.existsSync(path.join(basicDirectory, dir, 'course.conf'))).map(dir => path.join(basicDirectory, dir, 'course.conf'))

    // 遍历配置文件,读取配置写入结果字典
    try {
      configFileFullPathArr.forEach((fileFullPath: string) => {
        fs.readFile(fileFullPath, { encoding: 'utf8' }, (err, data) => {
          if (err) throw err
          data = data.split('\r\n').filter(line => !(line.startsWith('#') || line === '' || line.startsWith('audio'))).map(line => line.replace('=', ' = "').replace(/([^\]])$/, '$1"')).join('\r\n')
          const parseToml = Toml.parse(data, 0.5, '\r\n')
          const tempStr = `${parseToml.title}: http://s.langlangyun.com/c/index.html?name=${parseToml.course_name} \r\n`
          fs.appendFile('result.txt', tempStr, { encoding: 'utf8' }, err => {
            if (err) throw new Error('写入结果失败.')
          })
        })
      })
    } catch (error) {
      this.log(`解析失败,错误行: ${error.line} 列: ${error.column}. ${error.message}`)
    }
  }
}

export = LTable
