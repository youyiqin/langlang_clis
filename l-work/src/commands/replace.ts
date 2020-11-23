import { Command, flags } from '@oclif/command';
const fs = require('fs');
const fsPromises = fs.promises;

export default class Replace extends Command {
  static description = '从文本中读取每一行,使用正则表达式替换匹配的部分字符串.'

  static examples = [
    `$ l-work Replace`,
  ]

  static args = [
    { name: 'target', description: '目标文件', required: true }
  ]

  static flags = {
    regexp: flags.string({ char: 'r', description: '用于生成动态正则表达式的字符串,匹配目标内容', required: true }),
    targetRegExpStr: flags.string({ char: 't', description: '动态生成正则表达式的字符串,替换的内容,默认为空.', default: '', required: false })
  }

  async run() {
    const { flags, args } = this.parse(Replace);
    const { regexp, targetRegExpStr } = flags;
    const targetFile = args.target;

    try {
      // read target file content.
      const targetFileContent = await fsPromises.readFile(targetFile, 'utf8');
      const result = targetFileContent
        .split('\r\n')
        .map((line: string) => {
          return line.replace(new RegExp(regexp), targetRegExpStr)
        })
        .join('\r\n')
      await fsPromises.writeFile(targetFile, result, 'utf8')
    } catch (error) {
      console.log(error);
    }
  }
}
