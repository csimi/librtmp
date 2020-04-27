const net = require('net')
const { PlainHandshake } = require('./handshake')
const StreamFactory = require('./stream_factory')

const connect = async ({host = 'localhost', port = 1935, app, swfUrl, tcUrl, pageUrl, timeout = 0} = {}, Handshake = PlainHandshake, ...args) =>
  new Promise((resolve, reject) => {
    let timer = null
    if (timeout) {
      setTimeout(() => {
        reject(new Error('netConnection timeout'))
        socket.end()
      }, timeout)
    }
    const socket = net.connect({host, port})
    socket.once('error', reject)
    const handshake = new Handshake(socket)
    handshake.once("uninitialized", () => handshake.sendC0C1())
    handshake.once("handshake:done", async () => {
      const streamFactory = new StreamFactory(socket)
      const netConnection = streamFactory.netConnection
      try {
        await netConnection.connect({app, swfUrl, tcUrl, pageUrl}, ...args)
        resolve(netConnection)
      } catch(e) {
        reject(e)
        socket.end()
      } finally {
        if (timer) {
          clearTimeout(timer)
        }
      }
    })
  })

module.exports = {
  connect
}
