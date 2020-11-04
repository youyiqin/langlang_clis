import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import { saveCertificate } from '../lib'

export default class Build extends Command {
  static description = '初始化凭证,直接从浏览器复制token并输入即可.'

  static examples = [
    `$ l-work init`,
  ]

  async run() {
    // const { args, flags } = this.parse(Build)
    const token = await cli.prompt('从浏览器复制token并输入')
    saveCertificate(token)
  }
}
