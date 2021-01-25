import * as fs from 'fs'
import * as path from 'path'
import axios, { AxiosInstance } from 'axios'
const svnCommands = require('node-svn-ultimate')
import * as Colors from 'colors'
import { svnUrlDataType, certificateType } from './types'
import * as inquirer from 'inquirer'
const cheerio = require('cheerio')
import cli from 'cli-ux'
import { resolve } from 'dns'
import { rejects } from 'assert'

// const low = require('lowdb')
// const FileSync = require('lowdb/adapters/FileSync')
// const dbPath = path.join(process.env.HOME ?? process.cwd(), 'langlang_work.db')
// // if(!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '', 'utf8')
// const adapter = new FileSync(dbPath)
// const db = low(adapter)
// // init lowdb
// db.default({
//   course: []
// })
//   .write()

const kejianPath = path.join(process.env.HOME ?? process.cwd(), 'langlang_build_token.conf')
const cookiePath = path.join(process.env.HOME ?? process.cwd(), 'langlang_build_cookie.conf')
const errorPath = path.join(process.env.TEMP ?? process.cwd(), 'langlang_build_error.log')


const Header = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json;charset=UTF-8'
}

const initClient = (site: certificateType) => axios.create({
  timeout: 10000,
  withCredentials: true,
  maxRedirects: 0,
  headers: Object.assign({}, Header, {
    cookie: getCertificate(site).certificate
  })
})

function logAndExit(message: string, color = Colors.red) {
  console.log(color(message));
  process.exit()
}


function getCertificate(site: certificateType): {
  certificate: string
} {
  const confPath = site === "kejian" ? kejianPath : cookiePath
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

const saveCertificate = (str: string, certificateTypeStr: certificateType): boolean => {
  const confPath = certificateTypeStr === 'kejian' ? kejianPath : cookiePath
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
const getAttachmentsDownloadAndDownloadFiles = (Client: AxiosInstance, url: string, savePath: string = process.cwd()): Promise<{ status: boolean, fileName: string, downloadUrl: string, info: string }> => {

  return new Promise(async (resolve) => {
    await cli.wait(3000)
    try {
      const response = await Client.get(url)
      const htmlString = response.data
      const $ = cheerio.load(htmlString)
      // 下载地址数组,全都是a标签
      const downloadATagsArray = $('ul li .title > a').map(function (i: any, el: any) {
        const fileName = $(el).text()
        const downloadLinkAddr = $(el).attr('download-url') ?? $(el).attr('href')
        return {
          fileName, downloadLinkAddr
        }
      }).toArray()
      // 如果这一节没有附件,就退出
      if (downloadATagsArray.length === 0) {
        return resolve({
          status: false,
          fileName: '',
          downloadUrl: url,
          info: Colors.red('无附件')
        })
      }

      downloadATagsArray.forEach(async (item: any) => {
        const downloadUrl = item.downloadLinkAddr
        const saveFileName = item.fileName
        if (!(saveFileName.endsWith('.mp4') || saveFileName.endsWith('.fla'))) {
          // cli.action.start(`开始下载: ${saveFileName}......`)
          const response = await Client.get(downloadUrl, {
            responseType: 'stream'
          })
          const responseLength = ~~response.headers['content-length']

          const resultSavePath = path.join(savePath, saveFileName)
          // 如果文件存在,但是是不完整的,小于服务器返回的大小,则重新下载.
          if (fs.existsSync(resultSavePath) && fs.statSync(resultSavePath)['size'] < responseLength) {
            // 先删除再下载
            fs.unlinkSync(resultSavePath)
            // 创建写入流
            const writer = fs.createWriteStream(resultSavePath)
            response.data.pipe(writer)
            writer.on('finish', () => {
              // cli.action.stop()
              resolve({
                status: true,
                fileName: saveFileName,
                downloadUrl,
                info: Colors.green('✔')
              })
            })
            writer.on('error', (error) => {
              logError('download error\n' + error.message)
              // cli.action.stop()
              resolve({
                status: false,
                fileName: saveFileName,
                downloadUrl,
                info: Colors.red('下载失败')
              })
            })
          } else if (fs.existsSync(resultSavePath) && fs.statSync(resultSavePath)['size'] === responseLength) {
            // 如果存在且长度相等,则跳过
            // cli.action.stop()
            return resolve({
              status: true,
              fileName: saveFileName,
              downloadUrl,
              info: Colors.green('已存在')
            })
          } else {
            // 文件之前不存在,全新下载
            // 将响应结果数据通过管道写入磁盘文件
            const writer = fs.createWriteStream(resultSavePath)
            response.data.pipe(writer)
            writer.on('finish', () => {
              // cli.action.stop()
              resolve({
                status: true,
                fileName: saveFileName,
                downloadUrl,
                info: Colors.green('✔')
              })
            })
            writer.on('error', (error) => {
              logError('download error\n' + error);
              resolve({
                status: false,
                fileName: saveFileName,
                downloadUrl,
                info: Colors.red('下载失败')
              })
            })
          }
        } else {
          // cli.action.stop()
          return resolve({
            status: false,
            fileName: '',
            downloadUrl: url,
            info: Colors.red('跳过视频和fla文件')
          })
        }
      })

    } catch (error) {
      logError(error.message)
      console.log(error);
      return resolve({
        status: false,
        fileName: '',
        downloadUrl: url,
        info: Colors.red('异常页面')
      })
    }
  })
}


const chooseBuildOption = async (result: any[]): Promise<string[]> => {
  let buildTarget = []
  let buildArr = []
  return new Promise(async (resolve) => {
    try {
      // 如果只有一个目标,则不用选择
      if (result.length > 1) {
        // 选择需要构建的目标
        let isBuildAll: any = await inquirer.prompt([{
          name: 'all',
          message: '是否构建此目录下所有内容?',
          type: 'list',
          choices: [{ name: '全部' }, { name: '由我选择' }]
        }])
        if (isBuildAll.all === '由我选择') {
          buildTarget = await inquirer.prompt([
            {
              name: 'target',
              message: '选择需要构建的目标:',
              type: 'checkbox',
              choices: result.map(item => {
                return {
                  name: item.dir
                }
              })
            }
          ])
          // buildTarget.target is array
          buildArr = buildTarget.target
          resolve(buildArr)
        } else {
          // 全部构建
          buildArr = result.map(item => item.dir)
          resolve(buildArr)
        }
      } else {
        buildArr = result.map(item => item.dir)
        resolve(buildArr)
      }
    } catch (error) {
      console.log(error);
      process.exit()
    }
  })
}

const getCourseBasicInfo = async (content: string): Promise<{ status: boolean, url: string, title: string }> => {
  let title: string, url: string;
  return new Promise(async (resolve, rejects) => {
    content
      .replace(/\\r/g, '')
      .split('\n')
      .forEach(lineString => {
        if (!title || !url) {
          if (lineString.startsWith('title=')) {
            title = lineString.replace('title=', '').replace('\r', '')
          }
          if (lineString.startsWith('course_name=')) {
            url = `http://s.langlangyun.com/${lineString.replace('course_name=', '').replace('\r', '')}/`
          }
        }
      })

    // 得到title
    if (title && url) {
      const isExistCourseOnline = await getUrlStatus(url)
      resolve({
        status: isExistCourseOnline,
        url,
        title
      })
    } else {
      rejects({
        status: false,
        url: '',
        title: ''
      })
    }
  })
}

const getUrlStatus = async (url: string) => {
  try {
    const resp = await axios.get(url)
    return resp.status === 200
  } catch (error) {
    return false
  }
}


export default initClient
export { saveCertificate, getCertificate, logError, getSvnUrl, createFileOrDire, getAttachmentsDownloadAndDownloadFiles, chooseBuildOption, logAndExit, getCourseBasicInfo, getUrlStatus }
