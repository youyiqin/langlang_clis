import svnCommands from 'node-svn-ultimate'
import { exitCli, getLog4jsInstance } from './index'

export default class Svn {
  constructor () {
    this.log = getLog4jsInstance()
  }

  static getBuildType (path = '.') {
    svnCommands.commands.info(path, (err, data) => {
      if (err) {
        this.log.error(err)
        console.log(
          '无法获取此路径下的svn数据,详情查看temp目录下的lxl.log日志.'
        )
        exitCli()
      }
      const svnUrlData = {
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
        }
      })
      if (isValid) return svnUrlData
      this.log.debug('暂时不支持的svn构建类型,只支持课件/egret/cocos.')
      console.log('奇怪的路径,svn info 结果是:\n', data)
      exitCli()
    })
  }
}
