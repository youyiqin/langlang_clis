import { Command, flags } from '@oclif/command'
// import cli from 'cli-ux'
import { getCertificate } from '../lib'
// import * as inquirer from 'inquirer'
import axios from 'axios'
const cheerio = require('cheerio')

const certificate = getCertificate('cookie')
const cookie = certificate.certificate

export default class InitStore extends Command {
  static description = '构建本地数据库,存储相关数据,热更新.'

  static examples = [
    `$ l-work init_store`,
  ]

  async run() {
    // 配置平台是kejian, tapd是cookie
    axios.get('https://www.tapd.cn/company/my_take_part_in_projects_list', {
      headers: {
        cookie,
      }
    }).then((response => {
      if (response.status === 200) {
        const $ = cheerio.load(response.data)
        $('li a').each((i: number, elem: any) => {
          // const projectName = $(elem).attr('title')
          if (i >= 1) {
            return
          }
          const projectUrl = $(elem).attr('href')
          parseProjectHomepage(projectUrl)
        })

      } else {
        console.log(response.status, '请求失败.');
      }

    })).catch(err => console.log(err))
  }
}


const parseProjectHomepage = (url: string) => {

  axios.get(url, {
    // maxRedirects: 0,
    headers: {
      cookie,
    }
  }).then(resp => {
    if (resp.status !== 200) {
      console.log('error: ' + resp.status + url);
    }
    const $ = cheerio.load(resp.data);
    $('tbody tr')
      .filter(function (i: number, elem: HTMLElement) {
        return $(elem).attr('level') === '0' && $('.name-td', elem).attr('data-editable-value') !== undefined
      })
      .each(function (i: number, elem: HTMLElement) {
        const title = $('.name-td', elem).attr('data-editable-value')
        const targetUrl = $('a', elem)
          .filter(function (i: number, elem: HTMLElement) {
            return $(elem).attr('title') === title
          })
          .first()
        console.log(targetUrl);
      })
    console.log(url);
  }).catch(err => {
    console.log(err.message);
  })

}
