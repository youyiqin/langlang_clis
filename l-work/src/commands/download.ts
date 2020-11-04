import { Command, flags } from '@oclif/command'
import initClient, { logError, createFileOrDire, getAttachmentsDownloadAndDownloadFiles } from '../lib'
import cli from 'cli-ux'
const path = require('path')
import * as Colors from 'colors'
import * as pinyin from 'tiny-pinyin'
import * as inquirer from 'inquirer'
const FindFiles = require('file-regex')
const cheerio = require('cheerio')

const Client = initClient('cookie')

export default class Build extends Command {
  static description = '指定项目ID,从TAPD上获取项目结构,自动创建本地项目目录,初始化默认配置文件,填充课程基础数据.下载课程附件并且解压到项目课程目录下.'

  static examples = [
    `$ l-work download`,
  ]

  static flags = {
    path: flags.string({ char: 'p', description: '下载和构建项目目录的根地址,默认使用当前地址', default: process.cwd() })
  }

  static args = [{
    name: 'projectId',
    description: '项目的ID,例如材料包科学4的ID是56964365,可以从项目页面的地址栏获取',
    required: true
  }]

  async run() {
    const { args, flags } = this.parse(Build)
    const projectId = args.projectId
    const targetRootPath = flags.path
    const randomNum2TitleDir: { [name: string]: number } = {}
    try {
      const projectHomepageRes = await Client.get(`https://www.tapd.cn/${projectId}/prong/stories/stories_list?&perpage=50`)
      // $ 取主页的html数据
      const $ = cheerio.load(projectHomepageRes.data)
      // console.log($);
      const titleArr = $('tr')
        .filter(function (i: any, el: any) {
          // this == el
          return $(el)
            .attr('level') === '0'
        })
      // console.log(titleArr);
      titleArr.map((_: any, e: any) => {
        const title = $(e).find('.name-td')
          .attr('data-editable-value') || 'unknown'
        const randomNum = ~~(Math.random() * 8999 + 1000)
        const pinyinTitle = pinyin.convertToPinyin(`${title}${randomNum}`, '', true).replace(/[^a-zA-Z0-9]/g, '')
        randomNum2TitleDir[title] = randomNum
        const directoryName = pinyinTitle
        const fullDirectoryName = path.join(targetRootPath, directoryName)
        console.log(fullDirectoryName);
        createFileOrDire(path.join(fullDirectoryName, 'static', 'picture', 'jiaoan'), 'directory')
        // createFileOrDire(path.join(fullDirectoryName, 'static', 'json'), 'directory')
        // createFileOrDire(path.join(fullDirectoryName, 'static', 'mp3'), 'directory')
        // createFileOrDire(path.join(fullDirectoryName, 'course.conf'), 'file', `title=${title}\r\ncourse_name=_${pinyinTitle}\r\n`)
      })

      // 下载每一小节的附件并且解压到此小节的拼音目录下
      // 下载任务使用promise.all处理
      const tasksArr: Promise<any>[] = []
      const subTitleArr = $('tr')
        .filter(function (i: any, el: any) {
          // this equal element
          return $(el).attr('level') === '1'
        })
      subTitleArr.slice(0, 4).map(async (_: any, el: any) => {
        const title = $(el).find('.editable-td a').text()
        // 获取上级标题的拼音版本，去掉尾部数字
        const pinyinTitle = pinyin.convertToPinyin(title, '', true).replace(/[^a-zA-Z0-9]/g, '')
        const storyId = $(el).attr('story_id')
        const sourceUrl = `https://www.tapd.cn/${projectId}/attachments/attachments_list/story/${storyId}/${projectId}`
        // 这个链接是附件下载地址的来源,从这个链接过去,可以得到下载地址
        // console.log(sourceUrl);
        const targetPath = pinyinTitle + randomNum2TitleDir[`${title}`]
        tasksArr.push(getAttachmentsDownloadAndDownloadFiles(Client, sourceUrl, targetPath))
      })

      Promise.all(tasksArr).then(result => {
        console.log(result);
      })

    } catch (error) {
      logError(error.message);
      console.log(Colors.red(error.message), 'error downloading');
    }
  }
}
