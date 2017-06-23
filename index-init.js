'use strict';

const path = require('path');

const nmlInit = require(path.dirname(require.main.filename) + path.sep + 'node_modules' + path.sep + 'node-mod-load')('SHPS4Node-init');


nmlInit.addDir(__dirname + '/interface', true);
nmlInit.addDir(__dirname + '/src', true);

module.exports = nmlInit.libs['init.h'];
