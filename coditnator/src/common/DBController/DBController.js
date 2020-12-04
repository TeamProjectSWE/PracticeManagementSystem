import axios from 'axios';

//const ip = 'http://localhost:4000';
const ip = 'http://ddiggo.iptime.org';
const cookie = {
  state: ''
};

const paramsPrint = (obj) => {
  return;
  if(obj.url !== 'undefined') {
    console.log('-- url:')
    console.log(obj.url);
  }
  if(obj.params !== 'undefined') {
    console.log('-- params:')
    console.log(obj.params);
  }
  if(obj.callback !== 'undefined') {
    console.log('-- callback:')
    console.log(obj.callback);
  }
  if(obj.error !== 'undefined') {
    console.log('-- error:')
    console.log(obj.error);
  }
  if(obj.final !== 'undefined') {
    console.log('-- final:')
    console.log(obj.final);
  }
};

export const getSession = async(error) => {
  try{
    return await axios.get(ip + '/auth/session', { withCredentials: true })
  }
  catch (e){
    error(e);
  }
};

export const getData = async (url, callback, error, final) => {
  console.log('[ Get '+ url +' ]******************************');
  paramsPrint({
    url: url,
    params: {},
    callback: callback,
    error: error,
    final: final
  });
  // 초기화
  if(callback === undefined || typeof callback !== 'function')
    callback = (res) => {};
  if(error === undefined || typeof error !== 'function')
    error = (err) => {};
  if(final === undefined || typeof final !== 'function')
    final = () => {};

  try{
    const response = await axios.get(ip + url, { withCredentials: true })
    callback(response);
  }
  catch (e){
    error(e);
  }
  finally {
    final();
  }
};

export const putData = (url, params, callback, error, final) => {
  console.log('[ Put ]******************************');
  paramsPrint({
    url: url,
    params: params,
    callback: callback,
    error: error,
    final: final
  });
  // 초기화
  if(params === undefined || typeof params !== 'object')
    params = {};
  if(callback === undefined || typeof callback !== 'function')
    callback = (res) => {};
  if(error === undefined || typeof error !== 'function')
    error = (err) => {};
  if(final === undefined || typeof final !== 'function')
    final = () => {};

  axios.put(ip + url, params, { withCredentials: true })
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

export const deleteData = (url, callback, error, final) => {
  console.log('[ Delete ]******************************');
  paramsPrint({
    url: url,
    params: {},
    callback: callback,
    error: error,
    final: final
  });
  // 초기화
  if(callback === undefined || typeof callback !== 'function')
    callback = (res) => {};
  if(error === undefined || typeof error !== 'function')
    error = (err) => {};
  if(final === undefined || typeof final !== 'function')
    final = () => {};

  axios.delete(ip + url, { withCredentials: true })
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

export const postData = (url, params, callback, error, final) => {
  console.log('[ Post ]******************************');
  paramsPrint({
    url: url,
    params: params,
    callback: callback,
    error: error,
    final: final
  });
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

export const solveFile = (problemCode, file, language, callback, error, final) => {
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