const request = require('browser-request');
const urljoin = require('url-join');
const io = require('socket.io-client');
const connectionsMap = {};
const rxjs = require('@reactivex/rxjs');
const { Subscriber, Observable, Subject } = rxjs;

// BEGIN FROM ENCHANNEL-ZMQ
function deepFreeze(obj) {
  // Freeze properties before freezing self
  Object.getOwnPropertyNames(obj).forEach(name => {
    const prop = obj[name];
    if(typeof prop === 'object' && prop !== null && !Object.isFrozen(prop)) {
      deepFreeze(prop);
    }
  });
  // Freeze self
  return Object.freeze(obj);
}

function createSubscriber(socket) {
  return Subscriber.create(messageObject => {
    socket.emit('msg', messageObject);
  }, err => {
    // We don't expect to send errors to the kernel
    console.error(err);
  }, () => {
    // tear it down, tear it *all* down
    socket.removeAllListeners();
    socket.close();
  });
}

function createObservable(socket) {
  return Observable.fromEvent(socket, 'msg')
                   .map(msg => deepFreeze(msg))
                   .publish()
                   .refCount();
}

function createSubject(socket) {
  const subj = Subject.create(createSubscriber(socket),
                              createObservable(socket));
  return subj;
}
// END FROM ENCHANNEL-ZMQ

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
  return new Promise(resolve => {
    var socket = io.connect(urljoin(endpoint, 'shell', kernelId));
    var connections = connectionsMap[kernelId] = {
      shell: io.connect(urljoin(endpoint, 'shell', kernelId)),
      stdio: io.connect(urljoin(endpoint, 'stdio', kernelId)),
      iopub: io.connect(urljoin(endpoint, 'iopub', kernelId)),
      control: io.connect(urljoin(endpoint, 'control', kernelId)),
    };
    resolve({
      shell: createSubject(connections.shell),
      control: createSubject(connections.control),
      iopub: createSubject(connections.iopub),
      stdio: createSubject(connections.stdio),
    });
  });
}

export function disconnect(channels) {
  // TODO: Remove in 0.2.0 or later!
  if (typeof channels === 'string') {
    console.warn('disconnect(kernelId) is deprecated.  Use disconnect(channels) instead.');
    channels = connectionsMap[channels];
  }

  channels.shell.disconnect();
  channels.stdio.disconnect();
  channels.iopub.disconnect();
  channels.control.disconnect();
}

export function shutdown(endpoint, kernelId) {
  return rp(urljoin(endpoint, 'shutdown', kernelId)).then(x => {
    if (JSON.parse(x).kernelId !== kernelId) return Promise.reject('wrong kernel stopped');
  });
}
