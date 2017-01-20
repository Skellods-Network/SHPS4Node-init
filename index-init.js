'use strict';

const nmlInit = require('node-mod-load')('SHPS4Node-init');

nmlInit.addDir(__dirname + '/interface', true);
nmlInit.addDir(__dirname + '/src', true);

module.exports = nmlInit.libs['init.h'];
