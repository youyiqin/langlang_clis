import { Command, flags } from '@oclif/command'
import Client, { logError, getSvnUrl } from '../lib'
import * as Colors from 'colors'
const FindFiles = require('file-regex')

export default class Build extends Command {
  static description = '用于构建课件,游戏.'

  static examples = [
    `$ l-work Build <path>`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    path: flags.string({ char: 'p', description: '目标路径,默认为当前路径.' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f', description: '强制执行,建议不要用此标志' }),
    level: flags.string({ char: 'l', description: '项目目录查找层级,默认查两层.因此如果当前目录下有多个需要构建的子目录,或者当前目录就是需要构建的目录,都能自动构建.' })
  }

  async run() {
    const { args, flags } = this.parse(Build)

    const targetPath = flags.path ?? process.cwd()
    console.log(targetPath);

    // get target paths
    const result = await FindFiles(targetPath, /course\.(json|conf)$/, 2)
    console.log(result);
    process.exit()
    console.log('build running.');
    // check conf
    Client.post('http://course.suboy.cn/cgi/auth/build/course/conf')
      .then(res => {
        if (res.data.code !== 0) {
          console.log(Colors.red(res.data.message));
        } else {
          console.log(res.data);
        }
      })
      .catch(err => {
        logError(err.message);
        console.log(Colors.red(err.message));
        process.exit()
      })
  }
}
