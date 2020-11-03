import { Command, flags } from '@oclif/command'

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
    force: flags.boolean({ char: 'f' }),
  }

  async run() {
    const { args, flags } = this.parse(Build)

    const targetPath = flags.path ?? process.cwd()
    console.log('build running.');
  }
}
