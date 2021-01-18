import * as fs from 'fs'
import * as path from 'path'

/**
 * 验证器,包含课件支持的字段
 */
export const validStartString = [
  'alias',
  'active',
  'audio[]',
  'autoplay',
  'background',
  'background_color',
  'background_music',
  'bottom_bar_position',
  'backdrop',
  'cdn_name',
  'course_name',
  'control_bar_position',
  'click_learn',
  'cocos',
  'cover',
  'egret',
  'graphic_icon',
  'h5',
  'home_url',
  'home_icon',
  'loading_image',
  'list_PATTERN',
  'literacy',
  'learn_word',
  'layout',
  'menu',
  'menu_style',
  'menu_type',
  'music_icon',
  'muted_icon',
  'mode_image_icon',
  'mode_ppt_icon',
  'note',
  'no_video_control',
  'no_learn',
  'no_reload',
  'note_PATTERN',
  'note_icon',
  'next_icon',
  'next_page_icon',
  'play_icon',
  'pause_icon',
  'prev_page_icon',
  'prev_icon',
  'pagination',
  'page_btn_position',
  'picture',
  'params',
  'popover',
  'popover_bg',
  'portion_learn',
  'popover_close_icon',
  'video',
  'videoppt',
  'video_control',
  'video_loop',
  'video_progress',
  'video_progress_position',
  'video_progress_style',
  'video_progress_bottom',
  'video_progress_width',
  'video_poster',
  'reload_icon',
  'sound[]',
  'swiper_PATTERN',
  'swiper',
  'step',
  'simple',
  'scale',
  'stroke_icon',
  'stroke',
  'tip_word',
  'tip_icon',
  'tip_sound',
  'tip_image',
  'title',
  'icon',
  'icon_active',
  'icon_hover',
  'interactive',
  'is_button_bottom',
]

/**
 *
 * @param str 传入原始文件内容,拆分成一个包含单行字符串和行号的对象,如果单行内容是注释或者空行,则设置内容为空
 */
export const getLineObj = (str: string) => {
  return str.split('\r\n').map((e, i) => {
    return {
      content: e.startsWith('#') || /^\s+$/.test(e) ? '' : e,
      line: i + 1
    }
  })
}

/**
 * @param addr 检查地址是否需要检查,并且是否指向有效的存在的文件,跳过CDN和使用正则表达式的value
 */
export const isAValidAddr = (addr: string, parentFolder: string) => {
  let isNeedCheck = false;
  ['mp4', 'mp3', 'jpg', 'png', 'json'].some(item => {
    if (!addr.startsWith('//') && !addr.includes('*') && addr.endsWith(`.${item}`)) {
      isNeedCheck = true
    }
    return isNeedCheck
  });
  // 针对性检查这几类扩展文件
  if (isNeedCheck) {
    let newAddr = path.join(parentFolder, addr.replace(/\//g, '\\').replace(/^\/\//, ''))
    return fs.existsSync(newAddr)
  }
  return true
}


export const isValidOptionsValue = (key: string, value: string) => {
  const optionsIsBoolean = [
    "pagination",
    "video_progress",
    "video_control",
    "video_loop",
    "active",
    "no_reload",
    "no_video_control",
    "no_lantern_side",
    "no_learn",
    'popover',
    'tip_sound_autoplay'
  ];
  const isValidBoolean = optionsIsBoolean.includes(key) && !['true', 'value'].includes(value)
  const isValidScope = key === 'scale' && /0\.\d/.test(value)
  return isValidBoolean && isValidScope
}

export const isHasConflictKey = (key: string, arr: string[]) => {
  const conflictKeyObj: { [name: string]: string[] } = {
    'cocos': ['background'],
    'egret': ['background'],
    'h5': ['background'],
    'background': ['egret', 'cocos', 'h5'],
    'backdrop': ['pagination'],
    'pagination': ['backdrop']
  }
  // 检查冲突的key是否存在当前作用域
  if (key in conflictKeyObj) {
    const status = arr.some(i => {
      // console.log(i, conflictKeyObj[`${key}`]);
      // 当前冲突的所有key组成的数组,是否包含当前遍历到的作用域key
      return conflictKeyObj[`${key}`].includes(i)
    })
    return { status, info: conflictKeyObj[`${key}`].join(', ') }
  } else {
    return {
      status: false,
      info: ''
    }
  }
}


