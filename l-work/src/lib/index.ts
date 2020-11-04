import * as fs from 'fs'
import * as path from 'path'
import axios, { AxiosInstance } from 'axios'
const svnCommands = require('node-svn-ultimate')
import * as Colors from 'colors'
import { svnUrlDataType } from './types'
const cheerio = require('cheerio')
import cli from 'cli-ux'

const tokenPath = path.join(process.env.HOME ?? process.cwd(), 'langlang_build_token.conf')
const cookiePath = path.join(process.env.HOME ?? process.cwd(), 'langlang_build_cookie.conf')
const errorPath = path.join(process.env.TEMP ?? process.cwd(), 'langlang_build_error.log')


const Header = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json;charset=UTF-8'
}

const initClient = (certificateType: string) => axios.create({
  timeout: 6000,
  withCredentials: true,
  maxRedirects: 0,
  headers: Object.assign({}, Header, {
    [certificateType === 'token' ? 'token' : 'cookie']: getCertificate(certificateType).certificate
  })
})


function getCertificate(certificateType: string): {
  certificate: string
} {
  const confPath = certificateType === "token" ? tokenPath : cookiePath
  try {
    if (fs.existsSync(confPath)) {
      return {
        certificate: fs.readFileSync(confPath, 'utf8')
      }
    }
    return {
      certificate: ''
    }
  } catch (error) {
    logError(error.message)
    throw new Error(error.message)
  }
}

const saveCertificate = (str: string, certificateType: string): boolean => {
  const confPath = certificateType === 'token' ? tokenPath : cookiePath
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

const createFileOrDire = (_path: string, type = 'file', fileStr = '', callback: Function | undefined = undefined) => {
  if (type === 'file' && !fs.existsSync(path.dirname(_path))) {
    fs.mkdirSync(path.dirname(_path))
  }
  type === 'file' ? fs.writeFileSync(_path, fileStr, 'utf8') : fs.mkdirSync(_path, { recursive: true })
  if (callback !== undefined) callback()
}
// 获取附件地址,下载附件
const getAttachmentsDownloadAndDownloadFiles = (Client: AxiosInstance, url: string, savePath: string = process.cwd()) => {
  return new Promise(async (resolve) => {
    try {
      const response = await Client.get(url)
      const htmlString = response.data
      const $ = cheerio.load(htmlString)
      // 下载地址数组,全都是a标签
      const downloadATagsArray = $('').map(function (i: any, el: any) {

      }).toArray()
      // 如果这一节没有附件,就退出
      if (downloadATagsArray.length === 0) {
        return resolve({
          status: false,
          fileName: '',
          downloadUrl: url,
          info: '这一节没有附件'
        })
      }

      downloadATagsArray.forEach(async (el: any) => {
        const downloadUrl = $(el).attr('href')

        const saveFileName = $(el).text()
        console.log(saveFileName, 'is save file name', $(el));
        if (!(saveFileName.endsWith('.mp4') || saveFileName.endsWith('.fla'))) {
          // await downloadFile(downloadUrl, path.join(savePath, saveFileName))
          cli.action.start(`开始下载: ${saveFileName}......`)
          const response = await Client.get(downloadUrl, {
            responseType: 'stream'
          })

          console.log(response.data.length, 'data length');


          const resultSavePath = path.join(savePath, downloadUrl.slice(downloadUrl.indexOf('download/') + 11), saveFileName)
          if (fs.existsSync(resultSavePath) && fs.statSync(resultSavePath)['size'] < response.data.length) {
            console.log(Colors.blue(`${fs.statSync(resultSavePath)['size']}---${response.data.length}`));

            fs.unlinkSync(resultSavePath)
            // 将响应结果数据通过管道写入磁盘文件
            response.data.pipe(fs.createWriteStream(resultSavePath))
            // 监听管道状态,处理promise
            response.data.on('end', () => {
              cli.action.stop()
              return resolve({
                status: true,
                fileName: saveFileName,
                downloadUrl,
                info: 'success'
              })
            })
          } else if (!fs.existsSync(resultSavePath) || fs.statSync(resultSavePath)['size'] === response.data.length) {
            // console.log(Colors.blue(`${response.data.length}`));
            // 如果存在且长度相等,则跳过
            return resolve({
              status: true,
              fileName: saveFileName,
              downloadUrl,
              info: 'success'
            })
          }
        } else {
          return resolve({
            status: false,
            fileName: '',
            downloadUrl: url,
            info: '跳过视频和fla文件'
          })
        }
      })

    } catch (error) {
      logError(error.message)
      return resolve({
        status: false,
        fileName: '',
        downloadUrl: url,
        info: '异常页面'
      })
    }
  })
}


export default initClient
export { saveCertificate, getCertificate, logError, getSvnUrl, createFileOrDire, getAttachmentsDownloadAndDownloadFiles }
