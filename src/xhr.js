const { speedometer } = require('../src/utils');
const CancelToken = require('./../src/cancel');

const isSupportXhr = typeof XMLHttpRequest !== 'undefined';

function progressEventWrap (handle, isDownload) {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);

  return e => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : undefined;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;

    bytesNotified = loaded;

    const data = {
      loaded,
      total,
      progress: total ? (loaded / total) : undefined,
      bytes: progressBytes,
      rate: rate ? rate : undefined,
      estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
      event: e
    };

    data[isDownload ? 'download' : 'upload'] = true;

    handle(data);
  };
}

module.exports = isSupportXhr && function (config) {
  return new Promise(function xhrHandler(resolve, reject) {
    const {
      data,
      headers,
      responseType = 'json',
      method = 'GET',
      baseURL = '',
      url = '',
      timeout = 5000,
      transformResponse = data => data,
      transformRequest = (data, _) => data
    } = config;

    const request = new XMLHttpRequest();

    if (config.auth) {
      const {
        username = '',
        password = ''
      } = config.auth;

      headers[Authorization] = `Basic ${btoa(username + ':' + password)}`;
    }

    request.open(method.toUpperCase(), baseURL + url, true);
    request.timeout = timeout;

    request.onreadystatechange = function responseHandle() {
      if (!request || request.readyState !== 4) {
        return;
      }

      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      if (!request) {
        return;
      }

      const responseData = !responseType || responseType === 'text' || responseType === 'json' ? request.responseText : request.response;
      let responseHeaders = request.getAllResponseHeaders && request.getAllResponseHeaders() || '';
      responseHeaders = responseHeaders.trim().split(/[\r\n]+/);
      const resHeaders = {};
      responseHeaders.forEach((line) => {
        const parts = line.split(': ');
        const header = parts.shift();
        const value = parts.join(': ');
        resHeaders[header] = value;
      })

      const response = transformResponse({
        data: responseData,
        status: request.status,
        headers: resHeaders
      })

      resolve(response);

      if (config.cancel) {
        cancel.unsubscribe();
      }

      request = null;
    }

    // 主动取消
    request.onabort = function handleAbort () {
      if (!request) {
        return;
      }

      const error = new Error('Request aborted');
      error.code = 'ECONNABORTED';
      reject(error);

      request = null;
    }

    // 发生异常
    request.onerror = function handleError () {
      if (!request) {
        return;
      }

      const error = new Error('Network Error');
      error.code = 'ERR_NETWORK';
      reject(error);

      request = null;
    }

    // 超时
    request.ontimeout = function handleTimeout () {
      if (!request) {
        return;
      }

      const error = new Error(`timeout of ${timeout}ms exceeded`);
      error.code = 'ETIMEDOUT';
      reject(error);

      request = null;
    }

    // 设置header
    if ('setRequestHeader' in request && headers) {
      for (let key in headers) {
        request.setRequestHeader(key, headers[key]);
      }
    }

    // 设置withCredentials
    if (config.withCredentials !== undefined) {
      request.withCredentials = !!config.withCredentials;
    }

    // 设置下载进度回调
    if (config.onDownloadProgress && typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', progressEventWrap(config.onDownloadProgress, true));
    }

    // 设置上传进度回调
    if (request.upload && config.onUploadProgress && typeof config.onUploadProgress === 'function') {
      request.addEventListener('progress', progressEventWrap(config.onUploadProgress, false));
    }

    if (config.cancel && config.cancel instanceof CancelToken) {
      doCancel = () => {
        if (!request) {
          return;
        }
        const error = new Error(`canceled`);
        error.code = 'ERR_CANCELED';
        reject(error);
        request.abort();
        request = null;
      }

      config.cancel.subscribe(doCancel);
    }

    request.send(transformRequest(data || null));
  })
}