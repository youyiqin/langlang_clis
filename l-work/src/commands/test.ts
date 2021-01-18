import { Command, flags } from '@oclif/command'
import testObj from '../lib/testObj'
const globalAny: any = global

// const path = require('path')
import * as path from 'path';
import * as fs from 'fs';
import defaultRule from '../lib/rules/default'
const fsPromise = fs.promises;
const fse = require('fs-extra')

export default class Test extends Command {
  static description = '用于对课件配置文件进行测试.本来打算对多个项目进行测试,结果发现可以配合 powershell 或者 bash 命令直接搞定,就不写了.'

  static examples = [
    `$ l-work test <target folder>`,
  ]

  static args = [
    { name: 'target', default: process.cwd() }
  ]

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
  }

  async run() {
    const { args } = this.parse(Test);
    const { target } = args;
    globalAny.target = target
    const isCheckCurrent = fs.existsSync(path.join(target, 'course.conf'))
    if (isCheckCurrent) {
      if (fs.statSync(path.join(target, 'course.conf')).isDirectory()) {
        console.log('当前目录下存在名为 course.conf 的目录,无法测试.');
        process.exit()
      }
      const content = await fsPromise.readFile(path.resolve(target, 'course.conf'), 'utf8')
      // 后续增加规则,可以继续使用 .check(fn) 进行挂载
      testObj
        .setCheckObj(content)
        .check(defaultRule)
    } else {
      console.log('请进入单独项目进行测试,或者使用组合Unix或者powershell命令进行测试.');

    }
  }
}
