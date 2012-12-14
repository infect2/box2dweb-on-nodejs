box2dweb on nodejs
=======================================================

This project combines four open source projects to demonstrate a physics engine which runs on node.js, off from a Web browser.

## How to run
To see demo, load index.html which is located in client directory and
the click the top button, after running server.js by using node, or "node server.js".
please make sure node is installed previsouly.

## Source code layout
The client directory contains index.html and JS files, which are
supposed to run on top of a Web browser.
remoteworker.js is to register HTML5 Worker-like object which supports
only reduced set of method and functionalities including postMessage and
terminate. It utilized sockJS(WebSocket polyfill) to communicate with a
node server.

The node directory contains node's server JS file and physics engine
files. It uses socksJS to send simulated results back to the browser.

## Underyling open source projects
INFINIWALL: [github](https://github.com/cubiq/infiniwall.git)

box2dweb: [code google](code.google.com/p/box2dweb)

box2d-javascript-fun: [github](https://github.com/sethladd/box2d-javascript-fun/)

sockJS: [github](https://github.com/sockjs/sockjs-node)

## Supported platforms
As of now, it is tested only for Google Chrome browser and Safari
