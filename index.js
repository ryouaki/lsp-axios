const { methods } = require('./src/constants');
const { version } = require('./src/version');
const InterceptorManager = require('./src/interceptor');

class Axios {
  /**
   * constructor 构造函数
   * @param {Object} 默认配置
   */
  constructor(conf) {
    this.default = conf || {};
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager(),
    }
    this.Versin = version;
  }

  /**
   * request
   * @param {String|Object} url 请求接口地址，或者一个配置对象
   * @param {Object} config 请求配置信息
   * 
   * @returns {Promise} 返回结果。
   */
  request(url, config = {}) {
    // 如果第一个参数为一个对象，那么直接使用该对象，如果为字符串，则作为请求地址。
    if (typeof url === 'string') {
      config.url = url;
    } else {
      config = url || {};
    }

    config = Object.assign(this.default, config);

    const { headers } = config;

    // 兼容请求方法，并兜底get请求, 如果不是合法的http方法，则默认转get方法
    config.method = methods[(config.method || this.default.method).toLowerCase()] || 'get';

    const len = this.interceptors.request.size();
    const newConfig = config;

    // 执行前置拦截器，如果返回false表示需要中断执行。
    for (let i = 0; i < len; i++) {
      const handle = this.interceptors.request.get(i);
      let shouldReturn = false;
      let ret = {};
      try {
        if (handle.fulfilled && typeof handle.fulfilled === 'function') {
          shouldReturn = handle.fulfilled(newConfig) === false;
        }
      } catch (e) {
        if (handle.rejected && typeof handle.rejected === 'function') {
          shouldReturn = handle.rejected(e) === false;
          ret = e;
        }
      }
      if (shouldReturn) {
        return Promise.reject(ret);
      }
    }

    // 执行ajax请求
    let resultPromise;
    try {
      resultPromise = xhr(newConfig);
    } catch (e) {
      return Promise.reject(e);
    }
    // 执行后置拦截器
  }
}

for (let key in methods) {
  Axios.prototype[key] = function Methodhandle(url, config) {
    config.method = key;
    return this.request(url, config);
  }
}

const axios = new Axios();
axios.Axios = Axios;

module.exports = axios;