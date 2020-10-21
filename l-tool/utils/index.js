import fs from 'fs'
import os, { type } from 'os'
import path from 'path'
const log4js = require('log4js')
// basic vars
const tempdir = os.tmpdir()
// 通用退出函数
const exitCli = () => process.exit()

const getLog4jsInstance = () => {
  log4js.configure({
    appenders: {
      lxl: { type: 'file', filename: path.join(tempdir, 'lxl.log') }
    },
    categories: { default: { appenders: ['lxl'], level: 'debug' } }
  })
  return log4js.getLogger('lxl')
}

const saveCertificate = (type = 'course', value) => {
  if (type !== 'course' && type !== 'tapd') {
    throw new Error('暂不支持的凭证类型')
  }
  const confPath = path.join(tempdir, `${type}.txt`)
  fs.writeFile(confPath, value, (err) => {
    if (err) throw new Error('save certificate failed.')
  })
}

// get certificate and check valid
const getCertificate = (type = 'course') => {
  if (type !== 'course' && type !== 'tapd') {
    throw new Error('暂不支持的凭证类型')
  }
  const confPath = path.join(tempdir, `${type}.txt`)
  try {
    if (fs.existsSync(confPath)) {
      return fs.readFileSync(confPath, { encoding: 'utf8' })
    } else {
      log.info('先使用 lxl build init 命令进行初始化再重新运行程序.')
      console.log('先使用 lxl build init 命令进行初始化再重新运行程序.')
      exitCli()
    }
  } catch (error) {
    throw new Error('read certificate failed.')
  }
}

export { tempdir, getCertificate, saveCertificate, getLog4jsInstance, exitCli }
