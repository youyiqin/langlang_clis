import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import { saveCertificate } from '../lib'
import * as inquirer from 'inquirer'

export default class Build extends Command {
  static description = '初始化凭证,直接从浏览器通用配置管理页面或者TAPD页面复制凭证并输入即可.'

  static examples = [
    `$ l-work init`,
  ]

  async run() {
    // const { args, flags } = this.parse(Build)
    let certificateType: any = await inquirer.prompt([{
      name: 'type',
      message: '选择凭证来源:',
      type: 'list',
      choices: [{ name: '通用配置管理' }, { name: 'TAPD' }]
    }])
    const certificate = await cli.prompt(`从浏览器复制${certificateType.type === "TAPD" ? "cookie" : "token"}并输入`)
    cli.action.start('保存凭证...')
    if (saveCertificate(certificate, certificateType.type === "TAPD" ? "cookie" : "token")) {
      cli.action.stop()
    }
  }
}
