import { Command, flags } from '@oclif/command'
// import cli from 'cli-ux'
import { getCertificate } from '../lib'
// import * as inquirer from 'inquirer'
import axios from 'axios'
const assert = require('assert')

export default class Test extends Command {
  static description = '测试命令.'

  static examples = [
    `$ l-work test`,
  ]

  async run() {
    const certificate = getCertificate('kejian')
    const cookie = certificate.certificate
    assert.equal(cookie, 'sessionid=s%3AhjreL-6ju6o1lnjCmZq9-KNzveGmy4Ka.inO3zADnMNdosj0suMe7NtL%2FRnikKBoDeT%2BRHBP6m2I')
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
