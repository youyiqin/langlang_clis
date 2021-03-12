l-work
======

work cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/l-work.svg)](https://npmjs.org/package/l-work)
[![Downloads/week](https://img.shields.io/npm/dw/l-work.svg)](https://npmjs.org/package/l-work)
[![License](https://img.shields.io/npm/l/l-work.svg)](https://github.com/langlang_clis/l-work/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g l-work
$ l-work COMMAND
running command...
$ l-work (-v|--version|version)
l-work/0.0.0 win32-x64 node-v14.13.0
$ l-work --help [COMMAND]
USAGE
  $ l-work COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`l-work build [PATH]`](#l-work-build-path)
* [`l-work cp SOURCEDICT TARGETDICT`](#l-work-cp-sourcedict-targetdict)
* [`l-work download PROJECTID`](#l-work-download-projectid)
* [`l-work help [COMMAND]`](#l-work-help-command)
* [`l-work init`](#l-work-init)
* [`l-work list [DIR]`](#l-work-list-dir)
* [`l-work open [PATH]`](#l-work-open-path)
* [`l-work replace TARGET`](#l-work-replace-target)
* [`l-work search [KEYWORD]`](#l-work-search-keyword)
* [`l-work test [TARGET]`](#l-work-test-target)
* [`l-work time`](#l-work-time)

## `l-work build [PATH]`

用于构建课件,游戏.

```
USAGE
  $ l-work build [PATH]

ARGUMENTS
  PATH  [default: C:\Users\44300\git_repos\langlang_clis\l-work] 构建目标目录,默认为当前目录.

OPTIONS
  -e, --env=product|226  [default: product] 构建环境,默认使用product,可选的有226.
  -h, --help             show CLI help

  -l, --level=level      [default: 2]
                         项目目录查找层级,默认查两层.因此如果当前目录下有多个需要构建的子目录,或者当前目录就是需要构建的
                         目录,都能自动构建.

  -t, --template         是否使用公共模板,默认使用公共模板.

EXAMPLE
  $ l-work Build <path>
```

_See code: [src\commands\build.ts](https://github.com/langlang_clis/l-work/blob/v0.0.0/src\commands\build.ts)_

## `l-work cp SOURCEDICT TARGETDICT`

专用于复制课件基础结构和course.conf文件, 删除了不通用的mp4和图片素材等.

```
USAGE
  $ l-work cp SOURCEDICT TARGETDICT

EXAMPLE
  $ l-work cp folderA newFolderB
```

_See code: [src\commands\cp.ts](https://github.com/langlang_clis/l-work/blob/v0.0.0/src\commands\cp.ts)_

## `l-work download PROJECTID`

指定项目ID,从TAPD上获取项目结构,自动创建本地项目目录,初始化默认配置文件,填充课程基础数据.下载课程附件并且解压到项目课程目录下.

```
USAGE
  $ l-work download PROJECTID

ARGUMENTS
  PROJECTID  项目的ID,例如材料包科学4的ID是56964365,可以从项目页面的地址栏获取

OPTIONS
  -d, --download     默认为false,不下载附件.
  -l, --level=level  [default: 0] 标题的level级别，默认是0，有些奇奇怪怪的课程系列会不太一样，比如思维游戏就是1.

  -p, --path=path    [default: C:\Users\44300\git_repos\langlang_clis\l-work]
                     下载和构建项目目录的根地址,默认使用当前地址

EXAMPLE
  $ l-work download
```

_See code: [src\commands\download.ts](https://github.com/langlang_clis/l-work/blob/v0.0.0/src\commands\download.ts)_

## `l-work help [COMMAND]`

display help for l-work

```
USAGE
  $ l-work help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src\commands\help.ts)_

## `l-work init`

初始化凭证,直接从浏览器通用配置管理页面或者TAPD页面复制凭证并输入即可.

```
USAGE
  $ l-work init

EXAMPLE
  $ l-work init
```

_See code: [src\commands\init.ts](https://github.com/langlang_clis/l-work/blob/v0.0.0/src\commands\init.ts)_

## `l-work list [DIR]`

打印和保存当前目录下的课件的基本信息.

```
USAGE
  $ l-work list [DIR]

ARGUMENTS
  DIR  [default: C:\Users\44300\git_repos\langlang_clis\l-work] 默认检查目录是当前目录.

EXAMPLE
  $ l-work list
```

_See code: [src\commands\list.ts](https://github.com/langlang_clis/l-work/blob/v0.0.0/src\commands\list.ts)_

## `l-work open [PATH]`

打开当前目录或者指定目录的项目线上地址,课件或者游戏皆可.

```
USAGE
  $ l-work open [PATH]

ARGUMENTS
  PATH  [default: C:\Users\44300\git_repos\langlang_clis\l-work] 默认为当前目录,可以指定一个目录.

EXAMPLE
  $ l-work open [path]
```

_See code: [src\commands\open.ts](https://github.com/langlang_clis/l-work/blob/v0.0.0/src\commands\open.ts)_

## `l-work replace TARGET`

从文本中读取每一行,使用正则表达式替换匹配的部分字符串.

```
USAGE
  $ l-work replace TARGET

ARGUMENTS
  TARGET  目标文件

OPTIONS
  -r, --regexp=regexp                    (required) 用于生成动态正则表达式的字符串,匹配目标内容
  -t, --targetRegExpStr=targetRegExpStr  动态生成正则表达式的字符串,替换的内容,默认为空.

EXAMPLE
  $ l-work Replace
```

_See code: [src\commands\replace.ts](https://github.com/langlang_clis/l-work/blob/v0.0.0/src\commands\replace.ts)_

## `l-work search [KEYWORD]`

根据郎朗数据管理后台的搜索接口,定制 cli 搜索功能,只要在搜索之前复制好关键字就行,搜索自动读取粘贴板内容,支持搜索关键字,比如: diasdjdkjdi221i31j / 材料包健康 / 何旭超.(嘿嘿).

```
USAGE
  $ l-work search [KEYWORD]

ARGUMENTS
  KEYWORD  搜索关键字

OPTIONS
  -d, --debug        调试模式,默认关闭
  -h, --help         show CLI help
  -l, --limit=limit  限制最多结果数量,默认不限制.
  -t, --type=type    [default: all] 搜索类型,支持 cocos / egret / h5 / all, 默认进行全局搜索.
  -v, --version      show CLI version

EXAMPLE
  $ l-work search
```

_See code: [src\commands\search.ts](https://github.com/langlang_clis/l-work/blob/v0.0.0/src\commands\search.ts)_

## `l-work test [TARGET]`

用于对课件配置文件进行测试.本来打算对多个项目进行测试,结果发现可以配合 powershell 或者 bash 命令直接搞定,就不写了.

```
USAGE
  $ l-work test [TARGET]

OPTIONS
  -h, --help     show CLI help
  -v, --version  show CLI version

EXAMPLE
  $ l-work test <target folder>
```

_See code: [src\commands\test.ts](https://github.com/langlang_clis/l-work/blob/v0.0.0/src\commands\test.ts)_

## `l-work time`

幼小识字-书写乐园,将文字的时间区间整理成数组,并且粘贴到剪贴板.

```
USAGE
  $ l-work time

EXAMPLE
  $ l-work time
```

_See code: [src\commands\time.ts](https://github.com/langlang_clis/l-work/blob/v0.0.0/src\commands\time.ts)_
<!-- commandsstop -->
