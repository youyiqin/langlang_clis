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
* [`l-work hello [FILE]`](#l-work-hello-file)
* [`l-work help [COMMAND]`](#l-work-help-command)

## `l-work hello [FILE]`

describe the command here

```
USAGE
  $ l-work hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ l-work hello
  hello world from ./src/hello.ts!
```

_See code: [src\commands\hello.ts](https://github.com/langlang_clis/l-work/blob/v0.0.0/src\commands\hello.ts)_

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
<!-- commandsstop -->
