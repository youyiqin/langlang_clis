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
},{"./index":"../utils/index.js"}],"init.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _inkTextInput = _interopRequireDefault(require("ink-text-input"));

var _inkSpinner = _interopRequireDefault(require("ink-spinner"));

var _ink = require("ink");

var _utils = require("../utils");

var _Http = require("../utils/Http");

var _inkSelectInput = _interopRequireDefault(require("ink-select-input"));

var _inkDivider = _interopRequireDefault(require("ink-divider"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _utils.getLog4jsInstance)(); /// init, input your token.

const Init = () => {
  const [query, setQuery] = _react.default.useState('');

  const [end, setEnd] = _react.default.useState(false);

  const [waiting, setWaiting] = _react.default.useState(false);

  const [result, setResult] = _react.default.useState('');

  const [hasSelect, setHasSelect] = _react.default.useState(false);

  const [select, setSelect] = _react.default.useState('');

  const handleSelect = item => {
    // `item` = { label: 'First', value: 'first' }
    setSelect(item.value);
    setHasSelect(true);
  };

  const items = [{
    label: '通用配置管理',
    value: 'course'
  }, {
    label: 'TAPD需求管理',
    value: 'tapd'
  }]; // 提供正确和错误的回调函数

  function handleSubmit() {
    if (query !== '') {
      setWaiting(true);
      (0, _Http.validCourseToken)(select, query, () => {
        setEnd(true);
        setResult('Ok.');
        setTimeout(() => {
          process.exit();
        }, 1000);
      }, err => {
        setEnd(true);
        setResult('Failed.无效的凭证.');
        log.debug(err);
        setTimeout(() => {
          process.exit();
        }, 1000);
      });
    }
  }

  return /*#__PURE__*/_react.default.createElement(_ink.Box, {
    flexDirection: "column"
  }, /*#__PURE__*/_react.default.createElement(_inkDivider.default, {
    title: "CLI Token/Cookie Init."
  }), /*#__PURE__*/_react.default.createElement(_inkSelectInput.default, {
    items: items,
    onSelect: handleSelect
  }), hasSelect ? /*#__PURE__*/_react.default.createElement(_ink.Box, null, /*#__PURE__*/_react.default.createElement(_ink.Box, {
    marginRight: 1
  }, /*#__PURE__*/_react.default.createElement(_ink.Text, {
    color: "greenBright"
  }, "CLI init.Enter your ", select === 'course' ? 'token' : 'cookie', ":")), /*#__PURE__*/_react.default.createElement(_inkTextInput.default, {
    value: query,
    onChange: setQuery,
    onSubmit: handleSubmit
  })) : null, waiting ? /*#__PURE__*/_react.default.createElement(_ink.Box, null, end ? /*#__PURE__*/_react.default.createElement(_ink.Text, {
    color: "green"
  }, result) : /*#__PURE__*/_react.default.createElement(_ink.Text, null, /*#__PURE__*/_react.default.createElement(_ink.Text, {
    color: "green"
  }, /*#__PURE__*/_react.default.createElement(_inkSpinner.default, {
    type: "dots12"
  })), 'check token valid...')) : null);
};

var _default = Init;
exports.default = _default;
},{"../utils":"../utils/index.js","../utils/Http":"../utils/Http.js"}]},{},["init.js"], null)
//# sourceMappingURL=/init.js.map