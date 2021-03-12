import { Command, flags } from '@oclif/command'
import initClient from '../lib'
// import cli from 'cli-ux'
const Client = initClient('kejian')
import * as clipboardy from 'clipboardy'
import { red, green, yellow, magenta } from 'colors'

export default class Test extends Command {
  static description = '根据郎朗数据管理后台的搜索接口,定制 cli 搜索功能,只要在搜索之前复制好关键字就行,搜索自动读取粘贴板内容,支持搜索关键字,比如: diasdjdkjdi221i31j / 材料包健康 / 何旭超.(嘿嘿).'

  static examples = [
    `$ l-work search`,
  ]

  static args = [
    { name: 'keyword', description: '搜索关键字' }
  ]

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: "调试模式,默认关闭", default: false }),
    type: flags.string({ char: 't', description: '搜索类型,支持 cocos / egret / h5 / all, 默认进行全局搜索.', default: 'all' }),
    limit: flags.integer({ char: 'l', description: '限制最多结果数量,默认不限制.' })
  }

  async run() {
    const { args, flags } = this.parse(Test);
    const { keyword } = args;
    let { debug, type, limit } = flags;
    const searckKey = keyword ?? clipboardy.readSync();
    if (searckKey.length > 50) {
      console.log(red('粘贴板内容过长:'), green(searckKey));
      process.exit();
    } else {
      const searchArr = type === 'all' ? ['egret', 'cocos', 'h5'] : [`${type}`];
      searchArr.forEach(async (type: string) => {
        console.log(`\t\t开始搜索: ${green(searckKey)}\t\t\t搜索类型为:${yellow(type)}`);
        const res = await Client.post(`https://a.langlang.net.cn/api/proxy/build/${type}/stored`, {
          searchKey: searckKey
        })
        const data = await res.data;
        if (data.code !== 0) {
          if (debug) {
            console.log(data);
          } else {
            console.log(red('请求异常,请稍后再试.'));
          }
          process.exit();
        } else {
          const dataArr: data[] = data.data;
          if (dataArr.length === 0) {
            console.log(red(`${type}: 什么都没查到啊...`));
          } else {
            console.log(green(`${type}: 搜索结果如下:`));
            let width = process.stdout.columns ?? 48;
            width -= 2;
            dataArr
              .slice(0, limit ?? dataArr.length)
              .forEach(item => {
                console.log('*'.repeat(width));
                console.log(`*\n*\t\t线上地址: http://s.langlangyun.com/c/index.html?${type}=${green(item.hash_name)}\n*`);
                Object.entries(item)
                  .filter(i => {
                    const key = i[0];
                    return !(['course', '_id', 'catalog', 'grade', 'term'].includes(key))
                  })
                  .forEach(i => {
                    const [key, value] = i;
                    console.log('*\t' + `${green(key)}: ${magenta(decodeURI(value))}`.padEnd(width, ' '));
                  })
                console.log('*');
                console.log('*'.repeat(width));
              })
          }
        }
      })
    }

  }
}


interface data extends anyObject {
  hash_name: string,
  username: string,
  catalog: any,
  course: string,
  project: string,
  time: string,
  _id: string,
  term: string,
  grade: string,
  subject: string,
  lesson: string,
  svn_url: string,
}

interface anyObject {
  [name: string]: any
}
