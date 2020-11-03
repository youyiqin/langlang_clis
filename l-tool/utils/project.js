import fs from 'fs'
import path from 'path'
import { downloadFile } from './Download.js'
import Http, { createRequestOption } from './Http.js'
import * as cheerio from 'cheerio'
import * as pinyin from 'tiny-pinyin'
import { getLog4jsInstance } from './index'
const http = new Http()
const client = http.request(
  createRequestOption('tapd', 'https://tapd.cn/company/participant_projects')
)
const templateFileContent = fs.readFileSync(path.join(__dirname, 'course.conf'), 'utf8')
const log = getLog4jsInstance()

const getDownloadUrl = async (entranceUrl, saveTargetDir) => {
  try {
    const resp = await client.get(entranceUrl)
    const htmlString = resp.data
    const $ = cheerio.load(htmlString)
    const downloadATagsArr = $('a.link-title').filter(function (i, el) {
      return $(this).attr('title') === '本地下载'
    }).toArray()
    downloadATagsArr.forEach(async (el) => {
      const downloadUrl = $(el).attr('href')
      const saveTargetName = pinyin.convertToPinyin($(el).text(), '', true)
      if (!(saveTargetName.endsWith('mp4') || saveTargetName.endsWith('fla'))) {
        await downloadFile(downloadUrl, path.join(saveTargetDir, saveTargetName))
      }
    })
    return Promise.resolve(1)
  } catch (error) {
    log.error(error.message)
    return Promise.reject(error.message)
  }
}

/**
 * @param {type} _path 默认路径
 * @param {type} type = 文件名/目录名
 * @param {type} callback = 回调函数
 */
const createFileOrDire = (_path, type = 'file', callback = null) => {
  if (type === 'file' && fs.existsSync(path.dirname(_path))) {
    fs.mkdirSync(path.dirname(_path))
  }
  // let newPath = vim
  type === 'file' ? fs.writeFileSync(_path) : fs.mkdirSync(_path, { recursive: true })
  if (callback !== null) callback()
}

const addCourseConfFile = (basicCourseInfoStr, saveFullPath) => {
  const newTemplateFileContent = fs.existsSync(path.join(process.cwd(), 'course.conf')) ? fs.readFileSync(path.join(process.cwd(), 'course.conf'), 'utf8') : templateFileContent
  const content = basicCourseInfoStr + newTemplateFileContent
  fs.writeFileSync(saveFullPath, content, {
    encoding: 'utf8'
  })
}

/**
 * @param {type} projectId 按id获取课件项目结构体系,创建目录
 * @param {string} rootPath default is current directory
 */
const createProjectStructureDirc = (projectId, rootPath) => {
  const randomNum2TitleDir = {}
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
        const title = $(e).find('.name-td')
          .attr('data-editable-value') || 'unknown'
        const randomNum = ~~(Math.random() * 8999 + 1000)
        const pinyinTitle = pinyin.convertToPinyin(`${title}${randomNum}`, '', true).replace(/[,!.。，！]/g, '')
        randomNum2TitleDir[title] = randomNum
        const directoryName = pinyinTitle
        const fullDirectoryName = path.join(rootPath, directoryName)
        createFileOrDire(path.join(fullDirectoryName, 'static', 'picture', 'jiaoan'), 'directory')
        createFileOrDire(path.join(fullDirectoryName, 'static', 'json'), 'directory')
        createFileOrDire(path.join(fullDirectoryName, 'static', 'mp3'), 'directory')
        addCourseConfFile(`title=${title}` + '\n' + `course_name=_${pinyinTitle}` + '\n', path.join(fullDirectoryName, 'course.conf'))
      })

      // 下载每一小节的附件并且解压到此小节的拼音目录下
      const subTitleArr = $('tr')
        .filter(function (i, el) {
          // this equal element
          return $(this).attr('level') === '1'
        })
      subTitleArr.slice(0, 6).map(async (_, e) => {
        const title = $(e).find('.editable-td a').text()
        // 获取上级标题的拼音版本，去掉尾部数字
        const pinyinTitle = pinyin.convertToPinyin(title, '', true).replace(/\d{1,2}$/, '').replace(/[,!.。、，！]/g, '')
        const storyId = $(e).attr('story_id')
        const sourceUrl = `https://www.tapd.cn/${projectId}/attachments/attachments_list/story/${storyId}/${projectId}`
        await getDownloadUrl(sourceUrl, path.join(rootPath, `${pinyinTitle}${randomNum2TitleDir[title]}`))
      })

      return {
        success: true,
        // data:
        data: 'ok'
      }
    } catch (error) {
      return {
        success: false,
        data: error.message
      }
    }
  }
  return getDircStructure()
}

export { createProjectStructureDirc }
