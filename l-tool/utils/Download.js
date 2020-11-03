import fs from 'fs'
import { getLog4jsInstance, exitCli } from './index'
import Http, { createRequestOption } from './Http'

const http = new Http()
const client = http.request(createRequestOption('tapd', 'https://tapd.cn/company/participant_projects', {
  responseType: 'stream'
}))
const log = getLog4jsInstance()

// TODO 提供地址和保存位置全名即可下载
const downloadFile = async (url, fullPath) => {
  try {
    const response = await client.get(url)
    // pipe the result stream into a file on disc
    response.data.pipe(fs.createWriteStream(fullPath))

    // return a promise and resolve when download finishes
    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        log.info('success.', fullPath)
        // extrand the file
        if (fullPath.endsWith('.zip') || fullPath.endsWith('.rar') || fullPath.endsWith('.7z')) {
          //
        }
        resolve()
      })
      response.data.on('error', () => {
        log.error('download file failed:', fullPath)
        reject(new Error('Download Failed'))
      })
    })
  } catch (error) {
    log.error(error.message)
    exitCli()
  }
}

export { downloadFile }
