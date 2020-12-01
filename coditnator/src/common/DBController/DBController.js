import axios from 'axios';

//const ip = 'http://localhost:4000';
const ip = 'http://ddiggo.iptime.org';
const cookie = {
  state: ''
};

export const getData = (url, params, callback, error, final) => {
  // 초기화
  if(params === undefined || !Array.isArray(params))
    params = [];
  if(callback === undefined || typeof callback !== 'function')
    callback = (res) => {};
  if(error === undefined || typeof error !== 'function')
    error = (err) => {};
  if(final === undefined || typeof final !== 'function')
    final = () => {};

  params.map((param) => {
    return url += ('/' + param);
  });

  axios.get(ip + url, { withCredentials: true })
    .then((res) => {
      callback(res);
    })
    .catch((err) => {
      error(err);
    })
    .finally(() => {
      final();
    });
};

export const postData = (url, params, callback, error, final) => {
  // 초기화
  if(params === undefined || typeof params !== 'object')
    params = {};
  if(callback === undefined || typeof callback !== 'function')
    callback = (res) => {};
  if(error === undefined || typeof error !== 'function')
    error = (err) => {};
  if(final === undefined || typeof final !== 'function')
    final = () => {};

  axios.post(ip + url, params, { withCredentials: true })
    .then((res) => {
      callback(res);
    })
    .catch((err) => {
      error(err);
    })
    .finally(() => {
      final();
    });
}

function solveFile(problemCode, file, language, callback, error, final) {
  if (!(file instanceof File)) {
    error("parameter file must be a 'File' type")
  }
  let formData = new FormData()
  formData.append('source', file)

  postData(
    `/api/problem/${problemCode}/solve/${language}`,
    formData,
    callback,
    error,
    final,
  )
}