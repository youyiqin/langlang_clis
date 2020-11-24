import { Command, flags } from '@oclif/command'
// import cli from 'cli-ux'
import { getCertificate } from '../lib'
// import * as inquirer from 'inquirer'
import axios from 'axios'
const assert = require('assert')

export default class Push extends Command {
  static description = '将当前目录下的项目的有效线上地址更新到TAPD的父目录评论区.'

  static examples = [
    `$ l-work push`,
  ]

  async run() {
    const certificate = getCertificate('kejian')
    const cookie = certificate.certificate
    axios.post('http://kejian.suboy.cn/cgi/auth/build/course/conf', {
      template: true,
      env: 'product',
      url: 'svn://svn.cke123.com:4000/repos/langlang_course/langlang_course/cailiaobaomeishu4/secret_of_refrigerator812'
    }, {
      headers: {
        cookie,
      }
    }).then((response => {
      console.log(response.data);
    })).catch(err => console.log(err))
  }
}
