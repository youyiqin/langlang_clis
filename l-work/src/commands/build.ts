import { Command, flags } from '@oclif/command'
import initClient, { logError, getSvnUrl, chooseBuildOption } from '../lib'
import * as Colors from 'colors'
import cli from 'cli-ux'
const FindFiles = require('file-regex')

const Client = initClient('token')

export default class Build extends Command {
  static description = '用于构建课件,游戏.'

  static examples = [
    `$ l-work Build <path>`,
  ]

  static args = [
    { name: 'path', default: process.cwd(), description: '构建目标目录,默认为当前目录.' }
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    level: flags.string({ char: 'l', description: '项目目录查找层级,默认查两层.因此如果当前目录下有多个需要构建的子目录,或者当前目录就是需要构建的目录,都能自动构建.', default: '2' }),
    env: flags.string({ char: 'e', description: '构建环境,默认使用product,可选的有226.', default: 'product', options: ['product', '226'] }),
    template: flags.boolean({ char: 't', description: '是否使用公共模板,默认使用公共模板.', default: true })
  }

  async run() {
    const { args, flags } = this.parse(Build)
    const targetPath = args.path
    const level = flags.level
    const env = flags.env
    const template = flags.template
    // get target paths
    // 一个数组,每个元素都是一个对象,包含文件名和目录名
    cli.action.start(Colors.white('识别指定/默认地址内的目录...'))
    let result: { dir: string, file: string }[] = await FindFiles(targetPath, /course\.(json|conf)$/, level)
    result = result.filter(item => !item.dir.endsWith('static'))
    cli.action.stop()
    const buildTasksArr: any[] = []
    const buildArr = await chooseBuildOption(result)
    buildArr.forEach(async (item, index) => {
      buildTasksArr.push(new Promise(async (resolve, reject) => {
        // generator svn info data
        // item is target full path, it is a directory
        const svnData = await getSvnUrl(item)
        const postData = {
          env,
          template,
          url: svnData.url
        }
        cli.action.start(Colors.white('预处理构建流程...'))
        // check conf
        Client.post(`http://course.suboy.cn/cgi/auth/build/${svnData.buildType}/conf`, postData)
          .then(async res => {
            if (res.data.code !== 0) {
              cli.action.stop()
              console.log('提示信息:', Colors.red(`${res.data.message},address:${svnData.url}`));
              console.log(Colors.green('如果token失效,则重新从浏览器获取token,再运行 l-work init 命令初始化凭证.'));
              return resolve({
                status: false,
                dir: svnData.url.slice(svnData.url.lastIndexOf('/') + 1)
              })
            } else {
              // 别太快,如果是构建多个目标,间歇性等待一秒钟
              if ((index + 1) % 3 === 0) {
                cli.action.start('暂停等待几秒钟,太快服务器容易莫名其妙返回异常.');
                await cli.wait(5000)
                cli.action.stop()
              }
              // 配置检查没问题可以构建就构建,存在构建的目标不是想要的目标的可能,但是这个只能怪用的人...
              Client.post(`http://course.suboy.cn/cgi/auth/build/${svnData.buildType}/start`, svnData.buildType === "course" ? postData : {
                env,
                url: svnData.url
              }).then(buildRes => {
                if (buildRes.data.code === 0) {
                  cli.action.stop()
                  // build successfully
                  return resolve({
                    status: true,
                    dir: svnData.buildType === "course" ? res.data.data.title : res.data.data.course
                  })
                } else {
                  // build failed
                  cli.action.stop()
                  return resolve({
                    status: false,
                    dir: svnData.buildType === "course" ? res.data.title : res.data.course
                  })
                }
              }).catch(error => {
                // build failed
                cli.action.stop()
                logError(error.message)
                return resolve({
                  status: false,
                  dir: svnData.buildType === "course" ? res.data.title : res.data.course
                })
              })
            }
          })
          .catch(err => {
            cli.action.stop()
            logError(err.message);
            console.log(Colors.red(err.message));
            resolve({
              status: false,
              dir: svnData.url.slice(svnData.url.lastIndexOf('/') + 1)
            })
          })
      }))
    })
    // get promise all
    Promise.all(buildTasksArr)
      .then(result => {
        cli.table(result, {
          target: {
            minWidth: 48,
            get: row => row.dir
          },
          status: {
            get: row => row.status ? Colors.green('✔') : Colors.red('❌'),
          }
        })
      })
      .catch(err => {
        console.log(err.message);
        logError(err.message)
      })
  }
}
