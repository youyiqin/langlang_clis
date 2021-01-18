import { Test } from './types'
import { getLineObj } from '../lib/rules/public'

const testObj: Test = {
  content: '',
  setCheckObj(str: string) {
    this.content = str;
    this.checkObj = getLineObj(this.content);
    return this.of()
  },
  of() {
    return this
  },
  check(fn: (obj: {
    line: number,
    content: string
  }[]) => void) {
    fn(this.checkObj)
    return this.of()
  },
  toString() {
    this.content.split('\n').forEach(i => console.log(i))
    return this.of()
  },
  checkObj: []
}

export default testObj;
