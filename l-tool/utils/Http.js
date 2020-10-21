import axios from 'axios'
import {
  exitCli,
  getCertificate,
  getLog4jsInstance,
  saveCertificate
} from './index'

const Header = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json;charset=UTF-8'
}

const COURSE_TEST_URL = 'http://course.suboy.cn/cgi/auth/build/course/list'
const TAPD_TEST_URL =
  'https://www.tapd.cn/company/participant_projects?from=left_tree2'

export default class Http {
  constructor () {
    this.timeout = 6000
    this.withCredentials = true
  }

  /*
   * option 需要提供 header dict, baseURL
   */
  request (option) {
    const conf = {
      ...option,
      timeout: this.timeout,
      withCredentials: this.withCredentials,
      maxRedirects: 0
    }
    const instance = axios.create(conf)
    return instance
  }
}

function createRequestOption (
  type = 'course',
  referer = 'http://course.suboy.cn/'
) {
  const conf = {
    headers: {
      ...Header,
      [type === 'course' ? 'token' : 'cookie']: getCertificate(type),
      Referer: referer
    }
  }
  return conf
}

function validCourseToken (type, token, successCallbackFunc, errorCallbackFunc) {
  const log = getLog4jsInstance()
  const testUrl = type === 'course' ? COURSE_TEST_URL : TAPD_TEST_URL
  const http = new Http()
  const client = http.request({
    headers: {
      [type === 'course' ? 'token' : 'cookie']: token,
      ...Header
    }
  })
  client[type === 'course' ? 'post' : 'get'](testUrl)
    .then((resp) => {
      log.info('start check token/cookie valid...')
      log.debug(resp.data, resp.status)
      if (resp.data.code == 0 || resp.status == 200) {
        saveCertificate(type, token)
        successCallbackFunc()
      } else {
        errorCallbackFunc(resp.data)
      }
    })
    .catch((err) => errorCallbackFunc(err))
}

export { Header, validCourseToken, createRequestOption }
