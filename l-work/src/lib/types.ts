export type svnUrlDataType = {
  url: string;
  relativeUrl: string;
  buildType: string;
}

export type certificateType = 'kejian' | 'cookie'


export type Test = {
  content: string,
  checkObj: {
    line: number,
    content: string,
  }[],
  check: (fn: (testObj: { line: number, content: string }[]) => void) => Test,
  setCheckObj: (str: string) => Test,
  of: () => Test,
  toString: () => Test,
}
