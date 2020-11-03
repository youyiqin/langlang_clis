// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../utils/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exitCli = exports.getLog4jsInstance = exports.saveCertificate = exports.getCertificate = exports.tempdir = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _os = _interopRequireWildcard(require("os"));

var _path = _interopRequireDefault(require("path"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log4js = require('log4js'); // basic vars


const tempdir = _os.default.tmpdir(); // 通用退出函数


exports.tempdir = tempdir;

const exitCli = () => process.exit();

exports.exitCli = exitCli;

const getLog4jsInstance = () => {
  log4js.configure({
    appenders: {
      lxl: {
        type: 'file',
        filename: _path.default.join(tempdir, 'lxl.log')
      }
    },
    categories: {
      default: {
        appenders: ['lxl'],
        level: 'debug'
      }
    }
  });
  return log4js.getLogger('lxl');
};

exports.getLog4jsInstance = getLog4jsInstance;

const saveCertificate = (type = 'course', value) => {
  if (type !== 'course' && type !== 'tapd') {
    throw new Error('暂不支持的凭证类型');
  }

  const confPath = _path.default.join(tempdir, `${type}.txt`);

  _fs.default.writeFile(confPath, value, err => {
    if (err) throw new Error('save certificate failed.');
  });
}; // get certificate and check valid


exports.saveCertificate = saveCertificate;

const getCertificate = (type = 'course') => {
  if (type !== 'course' && type !== 'tapd') {
    throw new Error('暂不支持的凭证类型');
  }

  const confPath = _path.default.join(tempdir, `${type}.txt`);

  try {
    if (_fs.default.existsSync(confPath)) {
      return _fs.default.readFileSync(confPath, {
        encoding: 'utf8'
      });
    } else {
      log.info('先使用 lxl build init 命令进行初始化再重新运行程序.');
      console.log('先使用 lxl build init 命令进行初始化再重新运行程序.');
      exitCli();
    }
  } catch (error) {
    throw new Error('read certificate failed.');
  }
};

exports.getCertificate = getCertificate;
},{}],"../utils/Http.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validCourseToken = validCourseToken;
exports.createRequestOption = createRequestOption;
exports.Header = exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _index = require("./index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const Header = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json;charset=UTF-8'
};
exports.Header = Header;
const COURSE_TEST_URL = 'http://course.suboy.cn/cgi/auth/build/course/list';
const TAPD_TEST_URL = 'https://www.tapd.cn/company/participant_projects?from=left_tree2';

class Http {
  constructor() {
    this.timeout = 6000;
    this.withCredentials = true;
  }
  /*
   * option 需要提供 header dict, baseURL
   */


  request(option) {
    const conf = _objectSpread(_objectSpread({}, option), {}, {
      timeout: this.timeout,
      withCredentials: this.withCredentials,
      maxRedirects: 0
    });

    const instance = _axios.default.create(conf);

    return instance;
  } // createInstance


}

exports.default = Http;

function createRequestOption(type = 'course', referer = 'http://course.suboy.cn/', customConf = {}, customHeader = null) {
  const conf = _objectSpread({
    headers: _objectSpread(_objectSpread({}, customHeader === null ? Header : customHeader), {}, {
      [type === 'course' ? 'token' : 'cookie']: (0, _index.getCertificate)(type),
      Referer: referer
    })
  }, customConf);

  return conf;
}

function validCourseToken(type, token, successCallbackFunc, errorCallbackFunc) {
  const log = (0, _index.getLog4jsInstance)();
  const testUrl = type === 'course' ? COURSE_TEST_URL : TAPD_TEST_URL;
  const http = new Http();
  const client = http.request({
    headers: _objectSpread({
      [type === 'course' ? 'token' : 'cookie']: token
    }, Header)
  });
  client[type === 'course' ? 'post' : 'get'](testUrl).then(resp => {
    log.info('start check token/cookie valid...');
    log.debug(resp.data, resp.status);

    if (resp.data.code === 0 || resp.status === 200) {
      (0, _index.saveCertificate)(type, token);
      successCallbackFunc();
    } else {
      errorCallbackFunc(resp.data);
    }
  }).catch(err => errorCallbackFunc(err));
}
},{"./index":"../utils/index.js"}],"../utils/Download.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadFile = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _index = require("./index");

var _Http = _interopRequireWildcard(require("./Http"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const http = new _Http.default();
const client = http.request((0, _Http.createRequestOption)('tapd', 'https://tapd.cn/company/participant_projects', {
  responseType: 'stream'
}));
const log = (0, _index.getLog4jsInstance)(); // TODO 提供地址和保存位置全名即可下载

const downloadFile = async (url, fullPath) => {
  try {
    const response = await client.get(url); // pipe the result stream into a file on disc

    response.data.pipe(_fs.default.createWriteStream(fullPath)); // return a promise and resolve when download finishes

    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        log.info('success.', fullPath); // extrand the file

        if (fullPath.endsWith('.zip') || fullPath.endsWith('.rar') || fullPath.endsWith('.7z')) {//
        }

        resolve();
      });
      response.data.on('error', () => {
        log.error('download file failed:', fullPath);
        reject(new Error('Download Failed'));
      });
    });
  } catch (error) {
    log.error(error.message);
    (0, _index.exitCli)();
  }
};

exports.downloadFile = downloadFile;
},{"./index":"../utils/index.js","./Http":"../utils/Http.js"}],"../utils/project.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createProjectStructureDirc = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path2 = _interopRequireDefault(require("path"));

var _Download = require("./Download.js");

var _Http = _interopRequireWildcard(require("./Http.js"));

var cheerio = _interopRequireWildcard(require("cheerio"));

var pinyin = _interopRequireWildcard(require("tiny-pinyin"));

var _index = require("./index");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const http = new _Http.default();
const client = http.request((0, _Http.createRequestOption)('tapd', 'https://tapd.cn/company/participant_projects'));

const templateFileContent = _fs.default.readFileSync(_path2.default.join(__dirname, 'course.conf'), 'utf8');

const log = (0, _index.getLog4jsInstance)();

const getDownloadUrl = async (entranceUrl, saveTargetDir) => {
  try {
    const resp = await client.get(entranceUrl);
    const htmlString = resp.data;
    const $ = cheerio.load(htmlString);
    const downloadATagsArr = $('a.link-title').filter(function (i, el) {
      return $(this).attr('title') === '本地下载';
    }).toArray();
    downloadATagsArr.forEach(async el => {
      const downloadUrl = $(el).attr('href');
      const saveTargetName = pinyin.convertToPinyin($(el).text(), '', true);

      if (!(saveTargetName.endsWith('mp4') || saveTargetName.endsWith('fla'))) {
        await (0, _Download.downloadFile)(downloadUrl, _path2.default.join(saveTargetDir, saveTargetName));
      }
    });
    return Promise.resolve(1);
  } catch (error) {
    log.error(error.message);
    return Promise.reject(error.message);
  }
};
/**
 * @param {type} _path 默认路径
 * @param {type} type = 文件名/目录名
 * @param {type} callback = 回调函数
 */


const createFileOrDire = (_path, type = 'file', callback = null) => {
  if (type === 'file' && _fs.default.existsSync(_path2.default.dirname(_path))) {
    _fs.default.mkdirSync(_path2.default.dirname(_path));
  } // let newPath = vim


  type === 'file' ? _fs.default.writeFileSync(_path) : _fs.default.mkdirSync(_path, {
    recursive: true
  });
  if (callback !== null) callback();
};

const addCourseConfFile = (basicCourseInfoStr, saveFullPath) => {
  const newTemplateFileContent = _fs.default.existsSync(_path2.default.join(process.cwd(), 'course.conf')) ? _fs.default.readFileSync(_path2.default.join(process.cwd(), 'course.conf'), 'utf8') : templateFileContent;
  const content = basicCourseInfoStr + newTemplateFileContent;

  _fs.default.writeFileSync(saveFullPath, content, {
    encoding: 'utf8'
  });
};
/**
 * @param {type} projectId 按id获取课件项目结构体系,创建目录
 * @param {string} rootPath default is current directory
 */


const createProjectStructureDirc = (projectId, rootPath) => {
  const randomNum2TitleDir = {};

  const getDircStructure = async () => {
    try {
      const resp = await client.get(`https://www.tapd.cn/${projectId}/prong/stories/stories_list`);
      const htmlString = resp.data;
      const $ = cheerio.load(htmlString);
      const titleArr = $('tr').filter(function (i, el) {
        // this == el
        return $(this).attr('level') === '0';
      }); // 获取每一小节的标题,创建小节的目录结构

      titleArr.map((_, e) => {
        const title = $(e).find('.name-td').attr('data-editable-value') || 'unknown';
        const randomNum = ~~(Math.random() * 8999 + 1000);
        const pinyinTitle = pinyin.convertToPinyin(`${title}${randomNum}`, '', true).replace(/[,!.。，！]/g, '');
        randomNum2TitleDir[title] = randomNum;
        const directoryName = pinyinTitle;

        const fullDirectoryName = _path2.default.join(rootPath, directoryName);

        createFileOrDire(_path2.default.join(fullDirectoryName, 'static', 'picture', 'jiaoan'), 'directory');
        createFileOrDire(_path2.default.join(fullDirectoryName, 'static', 'json'), 'directory');
        createFileOrDire(_path2.default.join(fullDirectoryName, 'static', 'mp3'), 'directory');
        addCourseConfFile(`title=${title}` + '\n' + `course_name=_${pinyinTitle}` + '\n', _path2.default.join(fullDirectoryName, 'course.conf'));
      }); // 下载每一小节的附件并且解压到此小节的拼音目录下

      const subTitleArr = $('tr').filter(function (i, el) {
        // this equal element
        return $(this).attr('level') === '1';
      });
      subTitleArr.slice(0, 6).map(async (_, e) => {
        const title = $(e).find('.editable-td a').text(); // 获取上级标题的拼音版本，去掉尾部数字

        const pinyinTitle = pinyin.convertToPinyin(title, '', true).replace(/\d{1,2}$/, '').replace(/[,!.。、，！]/g, '');
        const storyId = $(e).attr('story_id');
        const sourceUrl = `https://www.tapd.cn/${projectId}/attachments/attachments_list/story/${storyId}/${projectId}`;
        await getDownloadUrl(sourceUrl, _path2.default.join(rootPath, `${pinyinTitle}${randomNum2TitleDir[title]}`));
      });
      return {
        success: true,
        // data:
        data: 'ok'
      };
    } catch (error) {
      return {
        success: false,
        data: error.message
      };
    }
  };

  return getDircStructure();
};

exports.createProjectStructureDirc = createProjectStructureDirc;
},{"./Download.js":"../utils/Download.js","./Http.js":"../utils/Http.js","./index":"../utils/index.js"}],"download/project.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _project = require("../../utils/project.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
/// lxl download project --pid=xxx
const Project = ({
  pid,
  rootPath = '.'
}) => {
  const [createStructureState, setCreateStructureState] = _react.default.useState({});

  _react.default.useEffect(() => {
    const result = (0, _project.createProjectStructureDirc)('35381138', rootPath);
    setCreateStructureState(result);
  }, []);

  return /*#__PURE__*/_react.default.createElement(_ink.Box, null, /*#__PURE__*/_react.default.createElement(_ink.Text, null, "download project: ", pid), createStructureState.success === true ? /*#__PURE__*/_react.default.createElement(_ink.Text, null, "1") : /*#__PURE__*/_react.default.createElement(_ink.Text, null, "2"), createStructureState.success === false ? /*#__PURE__*/_react.default.createElement(_ink.Text, null, "3") : /*#__PURE__*/_react.default.createElement(_ink.Text, null, "4"));
};

Project.propTypes = {
  pid: _propTypes.default.string.isRequired,
  rootPath: _propTypes.default.string
};
var _default = Project;
exports.default = _default;
},{"../../utils/project.js":"../utils/project.js"}]},{},["download/project.js"], null)
//# sourceMappingURL=/download/project.js.map