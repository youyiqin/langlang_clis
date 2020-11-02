import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
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
  'h5',
  'home_url',
  'loading_image',
  'list_PATTERN',
  'literacy',
  'learn_word',
  'menu',
  'menu_style',
  'no_video_control',
  'no_learn',
  'no_reload',
  'next_icon',
  'next_page_icon',
  'prev_page_icon',
  'prev_icon',
  'pagination',
  'picture',
  'popover',
  'popover_bg',
  'portion_learn',
  'popover_close_icon',
  'video',
  'video_progress',
  'video_progress_position',
  'video_progress_style',
  'video_progress_bottom',
  'video_progress_width',
  'video_poster',
  'swiper_PATTERN',
  'swiper',
  'step',
  'simple',
  'scale',
  'tip_word',
  'tip_sound',
  'tip_image',
  'title',
  'icon',
  'icon_active',
  'interactive',
  'is_button_bottom',
]

type checkResult = {
  noError: boolean,
  title: string,
  courseName: string,
  onlineUrl: string,
  errorMsg: {
    info: string, content: string
  }[]
}

function defaultCheckRule(content: string, currentPath: string, tempResult: checkResult): checkResult {
  // 获取首个title和course_name的值就行了,作为阀值
  let tempCount = 0

  content
    .split('\r\n').map((line, index) => {
      return {
        lineIndex: index,
        lineContent: line
      }
    })
    .filter(line => !(line.lineContent === '' || line.lineContent.startsWith('#')))
    .filter(line => !(line.lineContent.startsWith('[')))
    .forEach(line => {
      const kv = line.lineContent.split('=')
      // 检查键值对之间是否有多余的空格
      kv.forEach(value => {
        if (value.startsWith(' ') || value.endsWith(' ')) {
          tempResult.noError = false
          tempResult.errorMsg.push({
            info: `line: ${line.lineIndex}: 字段左右存在空格`,
            content: colors.red(line.lineContent)
          })
        }
      })
      // 检查键是否是有效的
      if (!(validStartString.includes(kv[0]))) {
        tempResult.noError = false
        tempResult.errorMsg.push({
          info: `line: ${line.lineIndex}: 存在未知的键值,如果没错就忽略,让我更新修复.`,
          content: colors.red(line.lineContent)
        })
      }
      if (kv.length === 2) {
        // 获取课程名和课程线上地址
        if (kv[0] === 'title' && tempCount <= 1) {
          tempResult.courseName = kv[1]
          tempCount += 1
        }
        if (kv[0] === 'course_name' && tempCount <= 1) {
          tempResult.onlineUrl = `http://s.langlangyun.com/c/index.html?name=${kv[1]}`
          tempCount += 1
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
            tempResult.errorMsg.push({
              info: `line: ${line.lineIndex}: 不合适的键值对组合.`,
              content: colors.red(line.lineContent)
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
        ].includes(kv[0]) && kv[1].indexOf('//') === -1 && kv[1].indexOf('*') === -1 && !(fs.existsSync(path.join(path.dirname(currentPath), kv[1])))) {
          tempResult.noError = false
          tempResult.errorMsg.push({
            info: `line: ${line.lineIndex}: 配置值指向的文件不存在.`,
            content: colors.red(line.lineContent)
          })
        }
      }
    })
  return tempResult
}

function limitPaginationAndBackdrop(content: string, currentPath: string, tempResult: checkResult): checkResult {
  const tomlStr = content
  // .split('\r\n')
  // .map((item, index) => {
  //   return {
  //     lineIndex: index,
  //     lineContent: item.replace('=', ' = ')
  //   }
  // })
  const data = toml.parse(tomlStr)
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
  result = limitPaginationAndBackdrop(content, currentPath, result)
  return result
}

function getAllCourseConfAndErrorMsg(basicDir: string): checkResult[] {
  const dirArr = fs.readdirSync(basicDir)
  return dirArr
    .filter((dir: string) => fs.existsSync(path.join(basicDir, dir, "course.conf")))
    .map((dir: string) => {
      const currentPath = path.join(basicDir, dir, "course.conf");
      const content = fs.readFileSync(currentPath, 'utf8')
      return check(content, currentPath)
    })
}

function echoCourseTable(data: checkResult[]): void {
  // 输出课程大纲
  console.log(colors.green('课程大纲:'));
  cli.table(data, {
    '课程名': {
      minWidth: 24,
      get: row => row.courseName
    },
    '线上地址': {
      get: row => row.onlineUrl
    }
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
      console.log(colors.green(item.title));
      item.errorMsg.forEach(i => {
        console.log(i.info, i.content);
      })
    })
}

class LTest extends Command {
  static description = 'describe the command here'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    // flag with a directory path (-d, --directory=VALUE)
    directory: flags.string({ char: 'd', description: 'course directiry, default is current directory' }),
    table: flags.boolean({ char: 't', description: '打印课程大纲,默认为不打印.' })
  }

  async run() {
    const { flags } = this.parse(LTest)
    const currentDir = flags.directory ?? process.cwd()
    const printCourseTable = flags.table ?? false
    this.log(colors.green(`检查${currentDir}下的所有course.conf文件?`))
    const name = await cli.prompt('(y/n)')
    if (name !== "y") process.exit()
    // get all config file full path
    const result = getAllCourseConfAndErrorMsg(currentDir)
    showResultAndError(result)
    printCourseTable && echoCourseTable(result)
  }
}

export = LTest
