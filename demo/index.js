import { spawn, shutdown } from 'enchannel-socketio-backend';
export function run() {
  const endpoint = prompt('kernel-relay endpoint:', 'http://localhost:3000/');
  const kernelName = prompt('kernel name:', 'python2');
  spawn(endpoint, kernelName).then(id => {
    return shutdown(endpoint, id);
  }).then(() => console.log('Done'));
}
