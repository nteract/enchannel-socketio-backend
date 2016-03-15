# enchannel-socketio-backend
![enchannel version](https://img.shields.io/badge/enchannel-1.1-ff69b4.svg)

:electric_plug: enchannel powered by socket.io, designed to be used with
[kernel-relay](https://github.com/nteract/kernel-relay).

## Installation

```bash
npm install enchannel-socketio-backend
```

## Usage

Enchannel-socketio-backend provides an API for spawning, disconnecting, and
shutting down remote kernels in addition to implementing the enchannel spec.  A
typical use would be to spawn a kernel, connect to the kernel and communicate
using enchannel and Jupyter message specs, disconnect from the kernel, and
optionally shut it down.

The act of connecting and disconnecting is deliberately separate to the act of
spawning and shutting down a kernel.  This allows one to spawn a kernel, start
some compute on it, disconnect and reconnect at a later time, and shutdown the
kernel when appropriate.

#### spawn
Spawns a remote kernel by name.  Takes two arguments:

 - endpoint, string - remote endpoint of the kernel-relay server  
 - kernelName, string - name of the kernel to spawn  

Returns a promise with the kernel id, string.

```
spawn(endpoint, kernelName)
```

Usage example

```js
const enchannelBackend = require('enchannel-socketio-backend');
enchannelBackend.spawn('http://localhost:3000/', 'python3').then(id => {
  console.log('spawned', id);
}).catch(err => {
  console.error('Could not spawn the kernel', err);
});
```

#### connect
Connects to a remote kernel by id.  Accepts two arguments:

 - endpoint, string - remote endpoint of the kernel-relay server  
 - kernelId, string - id of the kernel to connect to  

Returns a promise for an [enchannel spec channels
object](https://github.com/nteract/enchannel)

```
connect(endpoint, kernelId)
```

Usage example

```js
enchannelBackend.connect('http://localhost:3000/', id).then(channels => {
  console.log('connected', channels);
}).catch(err => {
  console.error('Could not connect to the kernel', err);
});
```

For API usage of the enchannel `channels` object, refer to the [enchannel spec README](https://github.com/nteract/enchannel).

#### shutdown
Shuts down a remote kernel by id.  Accepts two arguments:

 - endpoint, string - remote endpoint of the kernel-relay server  
 - kernelId, string - id of the kernel to shutdown

Returns a promise which resolves when the shutdown is complete.

```
shutdown(endpoint, kernelId)
```

Usage example

```js
enchannelBackend.shutdown('http://localhost:3000/', id).then(() => {
  console.log('shutdown');
}).catch(err => {
  console.error('Could not shutdown the kernel', err);
});
```

#### disconnect

Disconnects from a kernel by closing the channels.  Accepts one argument, the enchannel channels object.

Returns promise which resolves on success.

```
disconnect(channels)
```

Usage example

```js
enchannelBackend.disconnect(channels).then(() => {
  console.log('disconnected');
}).catch(err => {
  console.error('Could not close the channels', err);
});
```

## Development
To develop against enchannel-socketio-backend, first clone the repo then from within the
cloned folder run:

```bash
npm install
npm link
```

Before opening a pull request, please run the unit tests locally:

```bash
npm test
```
