import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import axios from 'axios'
const FindFiles = require('file-regex')
const fs = require('fs')
const path = require('path')
const colors = require('colors')
const toml = require('toml')


const validStartString = [
  '[',
  '[action]',
  'alias',
  'active',
  'audio[]',
  'autoplay',
  'background',
  'background_color',
  'background_music',
  'bottom_bar_position',
  'backdrop',
  'cdn_name',
  'course_name',
  'control_bar_position',
  'click_learn',
  'cocos',
  'cover',
  'egret',
  'graphic_icon',
  'h5',
  'home_url',
  'home_icon',
  'loading_image',
  'list_PATTERN',
  'literacy',
  'learn_word',
  'layout',
  'menu',
  'menu_style',
  'menu_type',
  'music_icon',
  'muted_icon',
  'mode_image_icon',
  'mode_ppt_icon',
  'note',
  'no_video_control',
  'no_learn',
  'no_reload',
  'note_PATTERN',
  'note_icon',
  'next_icon',
  'next_page_icon',
  'play_icon',
  'pause_icon',
  'prev_page_icon',
  'prev_icon',
  'pagination',
  'page_btn_position',
  'picture',
  'params',
  'popover',
  'popover_bg',
  'portion_learn',
  'popover_close_icon',
  'video',
  'videoppt',
  'video_control',
  'video_loop',
  'video_progress',
  'video_progress_position',
  'video_progress_style',
  'video_progress_bottom',
  'video_progress_width',
  'video_poster',
  'reload_icon',
  'sound[]',
  'swiper_PATTERN',
  'swiper',
  'step',
  'simple',
  'scale',
  'stroke_icon',
  'tip_word',
  'tip_icon',
  'tip_sound',
  'tip_image',
  'title',
  'icon',
  'icon_active',
  'icon_hover',
  'interactive',
  'is_button_bottom',
]

type checkResult = {
  noError: boolean,
  title: string,
  courseName: string,
  onlineUrl: string,
  status?: boolean,
  errorMsg: {
    info: string, content: string
  }[]
}

type courseDir = {
  dir: string;
  file: string;
}[]

function defaultCheckRule(content: string, currentPath: string, tempResult: checkResult): checkResult {
  // 获取首个title和course_name的值就行了,作为阀值
  let tempCount = 0

  content.replace(/\\r/g, '')
    .split('\n').map((line, index) => {
      return {
        lineIndex: index + 1,
        lineContent: line
      }
    })
    .filter(line => !(line.lineContent === '' || line.lineContent.startsWith('#') || line.lineContent.replace(/[ ]+/g, '') === ''))
    .filter(line => !(line.lineContent.startsWith('[')))
    .forEach(line => {
      const kv = line.lineContent.split('=')
      // 检查键值对之间是否有多余的空格
      kv.forEach(value => {
        if (value.startsWith(' ') || value.endsWith(' ') && value.indexOf(',') === -1) {
          tempResult.noError = false
          tempResult.errorMsg.push({
            info: `line: ${line.lineIndex}: 字段左右存在空格`,
            content: colors.yellow(line.lineContent)
          })
        }
      })
      // 检查键是否是有效的
      if (!(validStartString.includes(kv[0]))) {
        tempResult.noError = false
        tempResult.errorMsg.push({
          info: `line: ${line.lineIndex}: 存在未知的键值,如果没错就忽略,让我更新修复.`,
          content: colors.yellow(line.lineContent)
        })
      }
      if (kv.length === 2) {
        // 获取课程名和课程线上地址
        if (kv[0] === 'title' && tempCount <= 1) {
          tempResult.courseName = kv[1]
          tempCount += 1
        }
        if (kv[0] === 'course_name' && tempCount <= 1) {
          tempResult.onlineUrl = `http://s.langlangyun.com/${kv[1]}/index.html`
          tempCount += 1
        }
        // 检查是否有空的值
        if (kv[1] === "" || kv[1].indexOf(" ") !== -1 && kv[1].indexOf(',') === -1) {
          tempResult.noError = false
          tempResult.errorMsg.push({
            info: `line: ${line.lineIndex}: 漏写值,或者值之间存在多余的空格`,
            content: colors.yellow(line.lineContent)
          })
        }
        if (kv[0] === "")
          // 检查键值对组合
          if (!([
            "pagination",
            "video_progress",
            "avtive",
            "no_reload",
            "no_video_control",
            "no_learn",
            'popover',
            'tip_sound_autoplay'
          ].includes(kv[0]) === ["true", "false"].includes(kv[1]))) {
            tempResult.noError = false
            tempResult.errorMsg.push({
              info: `line: ${line.lineIndex}: 不合适的键值对组合.`,
              content: colors.yellow(line.lineContent)
            })
          }
        // 检查路径下文件是否存在
        if ([
          'character',
          'graphic',
          'swiper',
          'picture',
          'video',
          'cover',
          'step',
          'simple',
          'interactive',
          'list_PATTERN',
          'click_learn',
          'portion_learn',
          'literacy',
          'tip_image',
          'tip_sound',
          'background_music',
          'background',
          'backdrop',
          'jiaoan'
        ].includes(kv[0]) && kv[1].indexOf('//') === -1 && kv[1].indexOf('*') === -1) {
          if (kv[1].indexOf('|') !== -1) {
            if (!kv[1]
              .split('|')
              .every(item => {
                const fullPath = item.replace(/\//, '').replace(/\//g, '\\')
                return fs.existsSync(path.join(path.dirname(currentPath), fullPath))
              })) {
              tempResult.noError = false
              tempResult.errorMsg.push({
                info: `line: ${line.lineIndex}: 配置值指向的文件不存在.`,
                content: colors.yellow(line.lineContent)
              })
            }
          } else if (kv[1].startsWith('/') && !(fs.existsSync(path.join(path.dirname(currentPath), kv[1])))) {
            tempResult.noError = false
            tempResult.errorMsg.push({
              info: `line: ${line.lineIndex}: 配置值指向的文件不存在.`,
              content: colors.yellow(line.lineContent)
            })
          }
        }
      }
    })
  return tempResult
}

/*
* 1. pagination和backdrop共存
* 2. tip_word不能用图片,应该用tip_image
* 3. 游戏不能喝background共存
*/
function ruleA(content: string, currentPath: string, tempResult: checkResult): checkResult {
  const tomlStr = content
    .split('\n')
    .filter(item => !(item.startsWith('#') || item === '' || item.startsWith('audio')))
    .map(item => item.replace(/=(.*)/, '=\"$1\"'))
    .join('\n')
  const data = toml.parse(tomlStr);
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const element = data[key];
      if (!!element.pagination && !!element.backdrop) {
        tempResult.noError = false;
        tempResult.errorMsg.push({
          info: `${key}: 存在异常,pagination和backdrop不可共存.`,
          content: ""
        })
      }
      if (!!element.pagination && element.pagination == "true" && !!element.video && element.video.includes("|") && element?.video_progress == "true") {
        tempResult.noError = false;
        tempResult.errorMsg.push({
          info: `${key}: 多个视频轮播的是不需要进度条.`,
          content: ""
        })
      }
      if (!!element.tip_word && element.tip_word.includes("/")) {
        tempResult.noError = false;
        tempResult.errorMsg.push({
          info: `${key}: 下的tip_word内容存在异常`,
          content: `tip_word=${element.tip_word}`
        })
      }
      if (!!element.background && (!!element.egret || !!element.h5 || !!element.cocos)) {
        tempResult.noError = false;
        tempResult.errorMsg.push({
          info: `${key}: 存在异常,游戏和background不可共存.`,
          content: ""
        })
      }
    }
  }
  return tempResult
}
// 写法非常丑陋,想想怎么办
// 所有的规则都写在这里面.
function check(content: string, currentPath: string): checkResult {
  let result: checkResult = {
    noError: true,
    courseName: "Unknown",
    onlineUrl: "Unknown",
    errorMsg: [],
    title: path.dirname(currentPath)
  }

  // 使用不断添加的测试函数进行测试,我想用函数式的方法写,但是太菜,没想到怎么写.
  // push错误信息,包含info: 错误描述, content: 字段内容
  result = defaultCheckRule(content, currentPath, result)
  result = ruleA(content, currentPath, result)
  return result
}

function getAllCourseConfAndErrorMsg(courseDirInfo: courseDir): checkResult[] {
  return courseDirInfo
    .map((dirInfo) => {
      const currentPath = path.join(dirInfo.dir, dirInfo.file);
      // 彻底消除多个 sound[]= 的配置
      const content = fs.readFileSync(currentPath, 'utf8').replace(/sound\[\]\=.*\r\n/g, '')
      // nodejs doesn't support'
      // console.log(content.replaceAll('[]=', '='));

      return check(content, currentPath)
    })
}


function echoCourseTable(data: checkResult[]): void {
  const tasksArr: any = []
  data.forEach(item => {
    tasksArr.push(
      axios.get(item.onlineUrl)
        .then((response) => {
          return response.status === 200
        })
        .catch((error) => {
          return false
        })
    )
  })
  Promise.all(tasksArr)
    .then((result) => {
      data.map((course, index) => {
        return Object.assign(course, {
          status: result[index]
        })
      })
      // 输出课程大纲
      console.log(colors.green('课程大纲:'));
      cli.table(data, {
        '课程名': {
          minWidth: 24,
          get: row => row.courseName
        },
        '线上地址': {
          minWidth: 24,
          get: row => row.onlineUrl
        },
        '构建状态': {
          minWidth: 24,
          get: row => row.status ? colors.green("\t\t✔") : colors.red("\t\t×")
        }
      })
    })
    .catch(error => {
      console.log(error);
      process.exit(0)
    })
}

function showResultAndError(data: checkResult[]): void {
  const resultLength = data.length;
  const successLength = data.filter(item => item.noError).length;
  console.log(colors.gray('此目录下配置检查通过率: '), colors.green(`${successLength}/${resultLength}`));
  // 筛选出存在错误的小节
  data
    .filter(item => !item.noError)
    .forEach(item => {
      console.log(colors.green('\n位置:\t'), colors.white(item.title));
      item.errorMsg.forEach(i => {
        console.log(i.info, '\n', i.content);
      })
    })
}

function saveResult(data: checkResult[]) {
  if (fs.existsSync('course.txt')) {
    fs.unlinkSync('course.txt')
  }
  let maxSizeOfName = 0;
  data.forEach(course => {
    if (byteLength(course.courseName) >= maxSizeOfName) maxSizeOfName = byteLength(course.courseName);
  })
  data.forEach(course => {
    const expendCharNum = course.courseName.indexOf('”') !== -1 ? 8 : 0
    let name = course.courseName + ' '.repeat(maxSizeOfName - byteLength(course.courseName) + expendCharNum)
    fs.appendFileSync('course.txt', `${name}\t\t${course.onlineUrl}\n`)
  })
}

function byteLength(str: string): number {
  let byteLength = 0
  let len = str.length
  if (!str) return 0
  for (let i = 0; i < len; i++) {
    byteLength += str.charCodeAt(i) > 255 ? 2 : 1
  }
  return byteLength
}

class LTest extends Command {
  static description = 'describe the command here'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    // flag with a directory path (-d, --directory=VALUE)
    directory: flags.string({ char: 'd', description: 'course directiry, default is current directory' }),
    table: flags.boolean({ char: 't', description: '打印课程大纲,默认为不打印.' }),
    level: flags.string({ char: 'l', description: '查找文件的层级,默认查找2层.例如在当前目录下执行命令,可以对当前和当前目录下的文件内的course.conf进行测试.' }),
    force: flags.string({ char: 'f', description: '强制执行,不提示,默认开启', default: 'true' }),
    out: flags.boolean({ char: 'o', description: '输出保存课程线上地址的txt文档,添加此标志即可保存结果在当前目录下的course.txt文件内' })
  }

  async run() {
    const { flags } = this.parse(LTest)
    const currentDir = flags.directory ?? process.cwd()
    const printCourseTable = flags.table ?? false
    const depthLevel = flags.level ?? 2
    const force = flags.force
    const out = flags.out ?? false
    if (force === 'true') {
      this.log(colors.green(`检查${currentDir}下的所有course.conf文件.`))
    } else {
      this.log(colors.green(`检查${currentDir}下的所有course.conf文件?`))
      const name = await cli.prompt('(y/n)')
      if (name !== "y") process.exit()
    }
    // 获取目录下所有course.conf文件的路径
    const allConfPath = await FindFiles(currentDir, /course\.conf/, depthLevel)
    // get all config file full path
    const result = getAllCourseConfAndErrorMsg(allConfPath)
    showResultAndError(result)
    printCourseTable && echoCourseTable(result)
    out && saveResult(result)
  }
}

export = LTest
