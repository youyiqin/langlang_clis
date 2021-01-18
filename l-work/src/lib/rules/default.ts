import { validStartString, isAValidAddr, isHasConflictKey, isValidOptionsValue } from './public'
import * as colors from 'colors'
const globalAny: any = global
/**
 * @param fn 测试对象数组,成员是行号和内容
 * 1. 无效key
 * 2. 多余空格
 * 3. 重复key
 * 4. 空值key
 * 5. 无效地址,指向不存在的文件key
 * 6. 冲突的字段
 * 7. 无效的键值对,有些键只能是某些值
 */
export default function defaultRule(objArr: { line: number, content: string }[]) {
  let scopeKeysArr: string[] = [];
  console.log(colors.magenta('Start...'));
  objArr.forEach((i) => {
    // 不是空行和分段部分,就测试
    if (i.content !== '') {
      const key = i.content.split('=')[0]?.trim()
      const value = i.content.split('=')[1]?.trim()

      if (/^\[.*\]$/.test(i.content)) {
        scopeKeysArr.length = 0
      } else {
        if (value === undefined || key === undefined) {
          console.log(colors.red(`line ${i.line}${colors.green(' :: ')}${colors.underline(colors.green(`${key}:${value}`))} someone can not be undefiled.\n`));
        } else {
          if (!validStartString.includes(key)) {
            console.log(colors.red(`line ${i.line}${colors.green(' :: ')}${colors.underline(colors.green(key))} is invalid.\n`));
          }
          if (scopeKeysArr.includes(key)) {
            console.log(colors.red(`line ${i.line}${colors.green(' :: ')}${colors.underline(colors.green(key))} is repeat.\n`));
          }
          if (value.includes(' ') || key.includes(' ')) {
            console.log(colors.red(`line ${i.line}${colors.green(' :: ')}${colors.underline(colors.green(value))} has redundant space.\n`));
          }
          if (!isAValidAddr(value, globalAny.target)) {
            console.log(colors.red(`line ${i.line}${colors.green(' :: ')}${colors.underline(colors.green(value))} is not exist.\n`));
          }
          const { status, info } = isHasConflictKey(key, scopeKeysArr)
          if (status) {
            console.log(colors.red(`line ${i.line}${colors.green(' :: ')}${colors.underline(colors.green(key))} can not exist with some other conflict key.Such as: ${colors.underline(colors.green(info))}.\n`));
          }
          if (!isValidOptionsValue) {
            console.log(colors.red(`line ${i.line}${colors.green(' :: ')}${colors.underline(colors.green(value))} is invalid.\n`));
          }
        }

        scopeKeysArr.push(key)
      }
    }
  });
  console.log(colors.magenta('End...'));
}
