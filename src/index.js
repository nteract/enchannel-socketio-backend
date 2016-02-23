const request = require('browser-request');
const urljoin = require('url-join');

function rp(url) {
  return new Promise((resolve, reject) => {
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(body);
      } else {
        reject(body);
      }
    });
  });
}

export function spawn(endpoint, kernelName) {
  return rp(urljoin(endpoint, 'spawn', kernelName)).then(x => JSON.parse(x).id );
}

export function connect(endpoint, kernelId) {
  console.log('hello', endpoint, kernelId);
}

export function shutdown(endpoint, id) {
  return rp(urljoin(endpoint, 'shutdown', id)).then(x => {
    if (JSON.parse(x).id !== id) return Promise.reject('wrong kernel stopped');
  });
}
