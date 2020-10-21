import fs from 'fs'
import path from 'path'
import Http, { createRequestOption } from './Http.js'
import * as cheerio from 'cheerio'
import * as pinyin from 'tiny-pinyin'
// import { randomInt } from 'crypto'
// import { exitCli } from './index.js'

/**
 * @param {type} _path 默认路径
 * @param {type} type = 文件名/目录名
 * @param {type} callback = 回调函数
 */
const createFileOrDire = (_path, type = 'file', callback = null) => {
  if (type === "file" && fs.existsSync(path.dirname(_path))) {
    fs.mkdirSync(path.dirname(_path))
  }
  // let newPath = vim
  type === 'file' ? fs.writeFileSync(_path) : fs.mkdirSync(_path, { recursive: true})
  if (callback !== null) callback()
}

/**
 * @param {type} projectId I am argument projectId.按id获取课件项目结构体系,创建目录
 * @param {string} rootPath default is current directory
 */
const createProjectStructureDirc = (projectId, rootPath = 'test') => {
  const http = new Http()
  const client = http.request(
    createRequestOption('tapd', 'https://tapd.cn/company/participant_projects')
  )
  const getDircStructure = async () => {
    try {
      const resp = await client.get(
        `https://www.tapd.cn/${projectId}/prong/stories/stories_list`
      )
      const htmlString = resp.data
      const $ = cheerio.load(htmlString)
      const titleArr = $('tr')
        .filter(function (i, el) {
          // this == el
          return $(this)
            .attr('level') === '0'
        })
      // 获取每一小节的标题,创建小节的目录结构
      titleArr.map((_, e) => {
        // 输出获取到的目录
        console.log($(e)
          .find('.name-td')
          .attr('data-editable-value'))
        const title = $(e)
          .find('.name-td')
          .attr('data-editable-value') || 'unknown'
        const pinyinTitle = pinyin.convertToPinyin(`${title}${~~(Math.random() * 9998 + 1000)}`, '', true)
        const directoryName = pinyinTitle.replace(/[,!.。，！]/g, '')
        const fullDirectoryName = path.join(rootPath, directoryName)
        createFileOrDire(path.join(fullDirectoryName, 'static', 'picture', 'jiaoan'), 'directory')
        createFileOrDire(path.join(fullDirectoryName, 'static', 'json'), 'directory')
        createFileOrDire(path.join(fullDirectoryName, 'static', 'mp3'), 'directory')        
      })
    } catch (error) {
      console.log(error)
    }
  }
  getDircStructure()
}

export { createProjectStructureDirc }
