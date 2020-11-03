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
},{"./index":"../utils/index.js"}],"../utils/svn.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _nodeSvnUltimate = _interopRequireDefault(require("node-svn-ultimate"));

var _index = require("./index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Svn {
  constructor() {
    this.log = (0, _index.getLog4jsInstance)();
  }

  static getBuildType(path = '.') {
    _nodeSvnUltimate.default.commands.info(path, (err, data) => {
      if (err) {
        this.log.error(err);
        console.log('无法获取此路径下的svn数据,详情查看temp目录下的lxl.log日志.');
        (0, _index.exitCli)();
      }

      const svnUrlData = {
        url: data.entry.url,
        relativeUrl: data.entry['relative-url'],
        buildType: undefined
      };
      const buildTypeArr = [{
        patternString: '^/egret_game',
        type: 'egret'
      }, {
        patternString: '^/langlang_course',
        type: 'course'
      }, {
        patternString: '^/cocos_game',
        type: 'cocos'
      }];
      const isValid = buildTypeArr.some(buildTypeDict => {
        if (svnUrlData.relativeUrl.startsWith(buildTypeDict.patternString)) {
          svnUrlData.buildType = buildTypeDict.type;
        }
      });
      if (isValid) return svnUrlData;
      this.log.debug('暂时不支持的svn构建类型,只支持课件/egret/cocos.');
      console.log('奇怪的路径,svn info 结果是:\n', data);
      (0, _index.exitCli)();
    });
  }

}

exports.default = Svn;
},{"./index":"../utils/index.js"}],"build/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _ink = require("ink");

var _inkSpinner = _interopRequireDefault(require("ink-spinner"));

var _inkDivider = _interopRequireDefault(require("ink-divider"));

var _inkSelectInput = _interopRequireDefault(require("ink-select-input"));

var _utils = require("../../utils");

var _Http = _interopRequireWildcard(require("../../utils/Http"));

var _svn = _interopRequireDefault(require("../../utils/svn"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// init cli client
const http = new _Http.default(); // 成功获取客户端,则表示

const client = http.request((0, _Http.createRequestOption)()); // default is course type
// init log4js instance

const log = (0, _utils.getLog4jsInstance)(); // check token valid
/// 构建指定目录下的课件或者游戏,默认为当前目录

const Build = ({
  path = '.'
}) => {
  const basicUrl = 'http://course.suboy.cn/cgiss/auth/build/';

  const [errorMsg, setErrorMsg] = _react.default.useState();

  const [conf, setConf] = _react.default.useState();

  const [build, setBuild] = _react.default.useState(null);

  const [buildType, setBuildType] = _react.default.useState('');

  const [showSelect, setShowSelect] = _react.default.useState(true);

  const [courseName, setCourseName] = _react.default.useState('');

  const [postData, setPostData] = _react.default.useState({});

  const handleSelect = item => {
    if (item.value === 'exit') (0, _utils.exitCli)(); // 确定继续,执行构建

    setShowSelect(false);
    client.post(`${basicUrl}${buildType}/start`, postData).then(resp => {
      if (resp.data.code !== 0) {
        log.debug(resp.data.message);
        setErrorMsg(resp.data.message);
        (0, _utils.exitCli)();
      }

      setBuild({
        status: 'Success ✔',
        onlineLink: `http://s.langlangyun.com/c/index.html?name=${courseName}`
      });
      setTimeout(_utils.exitCli, 500);
    }).catch(err => {
      log.debug(err);
      setErrorMsg('奇怪的错误,检查日志文件.');
      setTimeout(_utils.exitCli, 500);
    });
  };

  const items = [{
    label: '确定',
    value: 'confirm'
  }, {
    label: '退出',
    value: 'exit'
  }];

  _react.default.useEffect(() => {
    // prev check,一定能拿到类型,否则就自动退出了,这里不需要加检查逻辑
    const buildData = _svn.default.getBuildType(path);

    setBuildType(buildData.buildType);
    const checkConfUrl = `${basicUrl}${buildData.buildType}/conf`;
    const buildRequestUrl = `${basicUrl}${buildData.buildType}/start`; // check config, create postData

    const tempPostData = {
      env: 'product',
      url: buildData.url
    };
    if (buildData.buildType !== 'course') tempPostData.template = true;
    client.post(checkConfUrl, tempPostData).then(resp => {
      if (resp.data.code !== 0) {
        log.debug(resp.data.message);
        setErrorMsg(resp.data.message);
        (0, _utils.exitCli)();
      }

      setPostData(tempPostData);
      setConf(resp.data.data);
      setCourseName(resp.data.data.course_name);
    }).catch(err => {
      log.debug(err);
      setErrorMsg('奇怪的错误,检查日志文件.');
      setTimeout(_utils.exitCli, 500);
    });
  }, []);

  return /*#__PURE__*/_react.default.createElement(_ink.Box, {
    flexDirection: "column"
  }, /*#__PURE__*/_react.default.createElement(_ink.Box, null, /*#__PURE__*/_react.default.createElement(_ink.Text, null, /*#__PURE__*/_react.default.createElement(_ink.Text, {
    color: "green"
  }, /*#__PURE__*/_react.default.createElement(_inkSpinner.default, {
    type: "dots"
  })), ' start build project.')), /*#__PURE__*/_react.default.createElement(_ink.Box, null, conf ? /*#__PURE__*/_react.default.createElement(_ink.Box, {
    flexDirection: "column",
    marginBottom: "1"
  }, /*#__PURE__*/_react.default.createElement(_inkDivider.default, {
    title: "\u6784\u5EFA\u81EA\u68C0,\u5F53\u524D\u914D\u7F6E\u5982\u4E0B:"
  }), Object.keys(conf).map(k => {
    return /*#__PURE__*/_react.default.createElement(_ink.Box, {
      key: k
    }, /*#__PURE__*/_react.default.createElement(_ink.Text, {
      color: "magenta"
    }, k, ":"), /*#__PURE__*/_react.default.createElement(_ink.Text, null, "\xA0\xA0\xA0\xA0"), /*#__PURE__*/_react.default.createElement(_ink.Text, null, conf[k] === true ? '✔' : conf[k]));
  }), showSelect ? /*#__PURE__*/_react.default.createElement(_inkSelectInput.default, {
    items: items,
    onSelect: handleSelect
  }) : null) : null), /*#__PURE__*/_react.default.createElement(_ink.Box, null, build ? /*#__PURE__*/_react.default.createElement(_ink.Box, {
    flexDirection: "column",
    marginBottom: "2"
  }, /*#__PURE__*/_react.default.createElement(_inkDivider.default, {
    title: "\u5F00\u59CB\u6784\u5EFA:"
  }), Object.keys(build).map(k => {
    return /*#__PURE__*/_react.default.createElement(_ink.Box, {
      key: `${k}1`
    }, /*#__PURE__*/_react.default.createElement(_ink.Text, null, k, ":"), /*#__PURE__*/_react.default.createElement(_ink.Text, {
      color: "green"
    }, build[k]));
  })) : null), errorMsg ? /*#__PURE__*/_react.default.createElement(_ink.Text, null, errorMsg) : null);
};

Build.propTypes = {
  path: _propTypes.default.string
};
Build.defaultProps = {
  path: '.'
};
var _default = Build;
exports.default = _default;
},{"../../utils":"../utils/index.js","../../utils/Http":"../utils/Http.js","../../utils/svn":"../utils/svn.js"}]},{},["build/index.js"], null)
//# sourceMappingURL=/build/index.js.map