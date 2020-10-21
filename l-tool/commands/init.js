import React from 'react'
import TextInput from 'ink-text-input'
import Spinner from 'ink-spinner'
import { Box, Text } from 'ink'
import { getLog4jsInstance } from '../utils'
import { validCourseToken } from '../utils/Http'
import SelectInput from 'ink-select-input'
import Divider from 'ink-divider'

const log = getLog4jsInstance()

/// init, input your token.
const Init = () => {
  const [query, setQuery] = React.useState('')
  const [end, setEnd] = React.useState(false)
  const [waiting, setWaiting] = React.useState(false)
  const [result, setResult] = React.useState('')
  const [hasSelect, setHasSelect] = React.useState(false)
  const [select, setSelect] = React.useState('')
  const handleSelect = (item) => {
    // `item` = { label: 'First', value: 'first' }
    setSelect(item.value)
    setHasSelect(true)
  }

  const items = [
    {
      label: '通用配置管理',
      value: 'course'
    },
    {
      label: 'TAPD需求管理',
      value: 'tapd'
    }
  ]
  // 提供正确和错误的回调函数
  function handleSubmit () {
    if (query !== '') {
      setWaiting(true)
      validCourseToken(
        select,
        query,
        () => {
          setEnd(true)
          setResult('Ok.')
          setTimeout(() => {
            process.exit()
          }, 1000)
        },
        (err) => {
          setEnd(true)
          setResult('Failed.无效的凭证.')
          log.debug(err)
          setTimeout(() => {
            process.exit()
          }, 1000)
        }
      )
    }
  }
  return (
    <Box flexDirection='column'>
      <Divider title='CLI Token/Cookie Init.' />
      <SelectInput items={items} onSelect={handleSelect} />
      {hasSelect ? (
        <Box>
          <Box marginRight={1}>
            <Text color='greenBright'>
              CLI init.Enter your {select === 'course' ? 'token' : 'cookie'}:
            </Text>
          </Box>
          <TextInput
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
          />
        </Box>
      ) : null}
      {waiting ? (
        <Box>
          {end ? (
            <Text color='green'>{result}</Text>
          ) : (
            <Text>
              <Text color='green'>
                <Spinner type='dots12' />
              </Text>
              {'check token valid...'}
            </Text>
          )}
        </Box>
      ) : null}
    </Box>
  )
}

export default Init
