import { Command, flags } from '@oclif/command'
const clipboardy = require('clipboardy')

export default class Time extends Command {
  static description = '幼小识字-书写乐园,将文字的时间区间整理成数组,并且粘贴到剪贴板.'

  static examples = [
    `$ l-work time`,
  ]

  async run() {
    // get clipborad strings
    const targetString = clipboardy.readSync()
    const result = targetString.split('\r\n')
      .filter((line: string) => line.endsWith('s'))
      .map((line: string) => line.replace(/s/g, '').match(/([0-9.]+)$/)[1])
    console.log(result);
    clipboardy.writeSync(`[${[0, ...result]}]`)
  }
}

