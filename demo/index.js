import { spawn, shutdown, connect, disconnect } from 'enchannel-socketio-backend';
import * as uuid from 'uuid';

export function run() {
  const endpoint = prompt('kernel-relay endpoint:', 'http://localhost:3000/');
  const kernelName = prompt('kernel name:', 'python2');
  spawn(endpoint, kernelName).then(id => {
    return connect(endpoint, id).then(channels => {
      const session = uuid.v4();
      channels.shell.next({
        header: {
          username: 'Anon',
          session,
          msg_type: 'kernel_info_request',
          msg_id: uuid.v4(),
          date: new Date(),
          version: '5.0',
        },
        metadata: {},
        parent_header: {},
        content: {},
      });
      channels.shell.subscribe(msg => console.log(msg));
      return new Promise(resolve => {
        setTimeout(() => {
          disconnect(id);
          resolve(id);
        }, 5000);
      });
    });
  }).then(id => {
    return shutdown(endpoint, id);
  }).then(() => console.log('Done'));
}
