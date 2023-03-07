const axios = require('../index');
const Axios = axios.Axios;

test('Class Axios', () => {
  const axios = new Axios();
  expect(JSON.stringify(axios)).toBe('{\"default\":{},\"interceptors\":{\"request\":{\"handles\":[]},\"response\":{\"handles\":[]}},\"Versin\":\"1.0.0\"}');
  expect(typeof Axios).toBe('function');
})

test('Instance Axios', () => {
  expect(JSON.stringify(axios)).toBe('{\"default\":{},\"interceptors\":{\"request\":{\"handles\":[]},\"response\":{\"handles\":[]}},\"Versin\":\"1.0.0\"}');
  expect(typeof axios).toBe('object');
})

test('Method get', () => {
  const axios = new Axios();
  expect(typeof axios.get).toBe('function');
  expect(typeof Axios.prototype.get).toBe('function');
})

test('Interceprot Manager use', () => {
  const axios = new Axios();
  expect(axios.interceptors.request.handles.length).toBe(0);
  axios.interceptors.request.use(function(config) {
    return true;
  })
  expect(axios.interceptors.request.handles.length).toBe(1);
})

test('Interceprot Manager clear', () => {
  const axios = new Axios();
  axios.interceptors.request.use(function(config) {
    return true;
  })
  expect(axios.interceptors.request.handles.length).toBe(1);
  axios.interceptors.request.clear();
  expect(axios.interceptors.request.handles.length).toBe(0);
})

test('Interceprot Manager eject function', () => {
  const axios = new Axios();
  function test() {
  }
  axios.interceptors.request.use(test);
  expect(axios.interceptors.request.handles.length).toBe(1);
  axios.interceptors.request.eject(test);
  expect(axios.interceptors.request.handles.length).toBe(0);
})

test('Interceprot Manager eject object', () => {
  const axios = new Axios();
  const test = {
    fulfilled: function() {},
    rejected: function() {}
  }
  axios.interceptors.request.use(test);
  expect(axios.interceptors.request.handles.length).toBe(1);
  console.log(axios.interceptors.request[0])
  axios.interceptors.request.eject(test);
  expect(axios.interceptors.request.handles.length).toBe(0);
})