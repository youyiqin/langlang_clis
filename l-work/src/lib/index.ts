import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
const svnCommands = require('node-svn-ultimate')
import * as Colors from 'colors'
import { svnUrlDataType } from './types'

const confPath = path.join(process.env.HOME ?? process.cwd(), 'langlang_build.conf')
const errorPath = path.join(process.env.TEMP ?? process.cwd(), 'langlang_build_error.log')

const Header = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json;charset=UTF-8'
}

const Client = axios.create({
  timeout: 6000,
  withCredentials: true,
  maxRedirects: 0,
  headers: Object.assign({}, Header, getCertificate())
})


function getCertificate(): {
  token: string
} {
  try {
    if (fs.existsSync(confPath)) {
      return {
        token: fs.readFileSync(confPath, 'utf8')
      }
    }
    return {
      token: ''
    }
  } catch (error) {
    logError(error.message)
    throw new Error(error.message)
  }
}

const saveCertificate = (str: string): boolean => {
  try {
    fs.writeFileSync(confPath, str, 'utf8')
    return true
  } catch (error) {
    logError(error.message)
    throw new Error(error.message)
  }
}

const logError = (logStr: string) => {
  try {
    fs.appendFileSync(errorPath, logStr, 'utf8')
  } catch (error) {
    throw new Error(error.message)
  }
}

const getSvnUrl = async (path = process.cwd()): Promise<svnUrlDataType> => {
  return new Promise((resolve, reject) => {
    svnCommands.commands.info(path, (err: any, data: any) => {
      if (err) {
        logError(err.message ?? err)
        console.log(Colors.red(`无法获取 ${path} 的svn仓库信息.`));
        process.exit()
      }
      const svnUrlData: svnUrlDataType = {
        url: data.entry.url,
        relativeUrl: data.entry['relative-url'],
        buildType: undefined
      }
      const buildTypeArr = [
        {
          patternString: '^/egret_game',
          type: 'egret'
        },
        {
          patternString: '^/langlang_course',
          type: 'course'
        },
        {
          patternString: '^/cocos_game',
          type: 'cocos'
        }
      ]
      const isValid = buildTypeArr.some((buildTypeDict) => {
        if (svnUrlData.relativeUrl.startsWith(buildTypeDict.patternString)) {
          svnUrlData.buildType = buildTypeDict.type
          return true
        }
        return false
      })
      if (isValid) {
        resolve(svnUrlData)
      } else {
        logError('此路径不是有效的可构建路径,目前仅仅支持构建课件/egret game/cocos game.')
        console.log(Colors.red(('此路径不是有效的可构建路径,目前仅仅支持构建课件/egret game/cocos game.')));
        process.exit()
      }
    })
  })
}

export default Client
export { saveCertificate, getCertificate, logError, getSvnUrl }
