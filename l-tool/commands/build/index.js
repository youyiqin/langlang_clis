import React from 'react'
import PropTypes from 'prop-types'
import { Text, Box } from 'ink'
import Spinner from 'ink-spinner'
import Divider from 'ink-divider'
import SelectInput from 'ink-select-input'
import { getLog4jsInstance, exitCli } from '../../utils'
import Http, { createRequestOption } from '../../utils/Http'
import Svn from '../../utils/svn'

// init cli client
const http = new Http()
// 成功获取客户端,则表示
const client = http.request(createRequestOption()) // default is course type
// init log4js instance
const log = getLog4jsInstance()
// check token valid

/// 构建指定目录下的课件或者游戏,默认为当前目录
const Build = ({ path = '.' }) => {
  const basicUrl = 'http://course.suboy.cn/cgiss/auth/build/'
  const [errorMsg, setErrorMsg] = React.useState()
  const [conf, setConf] = React.useState()
  const [build, setBuild] = React.useState(null)
  const [buildType, setBuildType] = React.useState('')
  const [showSelect, setShowSelect] = React.useState(true)
  const [courseName, setCourseName] = React.useState('')
  const [postData, setPostData] = React.useState({})
  const handleSelect = (item) => {
    if (item.value === 'exit') exitCli()
    // 确定继续,执行构建
    setShowSelect(false)
    client
      .post(`${basicUrl}${buildType}/start`, postData)
      .then((resp) => {
        if (resp.data.code !== 0) {
          log.debug(resp.data.message)
          setErrorMsg(resp.data.message)
          exitCli()
        }
        setBuild({
          status: 'Success ✔',
          onlineLink: `http://s.langlangyun.com/c/index.html?name=${courseName}`
        })
        setTimeout(exitCli, 500)
      })
      .catch((err) => {
        log.debug(err)
        setErrorMsg('奇怪的错误,检查日志文件.')
        setTimeout(exitCli, 500)
      })
  }
  const items = [
    {
      label: '确定',
      value: 'confirm'
    },
    {
      label: '退出',
      value: 'exit'
    }
  ]
  React.useEffect(() => {
    // prev check,一定能拿到类型,否则就自动退出了,这里不需要加检查逻辑
    const buildData = Svn.getBuildType(path)
    setBuildType(buildData.buildType)
    const checkConfUrl = `${basicUrl}${buildData.buildType}/conf`
    const buildRequestUrl = `${basicUrl}${buildData.buildType}/start`
    // check config, create postData
    const tempPostData = {
      env: 'product',
      url: buildData.url
    }
    if (buildData.buildType !== 'course') tempPostData.template = true
    client
      .post(checkConfUrl, tempPostData)
      .then((resp) => {
        if (resp.data.code !== 0) {
          log.debug(resp.data.message)
          setErrorMsg(resp.data.message)
          exitCli()
        }
        setPostData(tempPostData)
        setConf(resp.data.data)
        setCourseName(resp.data.data.course_name)
      })
      .catch((err) => {
        log.debug(err)
        setErrorMsg('奇怪的错误,检查日志文件.')
        setTimeout(exitCli, 500)
      })
  }, [])

  return (
    <Box flexDirection='column'>
      <Box>
        <Text>
          <Text color='green'>
            <Spinner type='dots' />
          </Text>
          {' start build project.'}
        </Text>
      </Box>
      <Box>
        {conf ? (
          <Box flexDirection='column' marginBottom='1'>
            <Divider title='构建自检,当前配置如下:' />
            {Object.keys(conf).map((k) => {
              return (
                <Box key={k}>
                  <Text color='magenta'>{k}:</Text>
                  <Text>&nbsp;&nbsp;&nbsp;&nbsp;</Text>
                  <Text>{conf[k] === true ? '✔' : conf[k]}</Text>
                </Box>
              )
            })}
            {showSelect ? (
              <SelectInput items={items} onSelect={handleSelect} />
            ) : null}
          </Box>
        ) : null}
      </Box>
      <Box>
        {build ? (
          <Box flexDirection='column' marginBottom='2'>
            <Divider title='开始构建:' />
            {Object.keys(build).map((k) => {
              return (
                <Box key={`${k}1`}>
                  <Text>{k}:</Text>
                  <Text color='green'>{build[k]}</Text>
                </Box>
              )
            })}
          </Box>
        ) : null}
      </Box>
      {errorMsg ? <Text>{errorMsg}</Text> : null}
    </Box>
  )
}

Build.propTypes = {
  path: PropTypes.string
}

Build.defaultProps = {
  path: '.'
}

export default Build
