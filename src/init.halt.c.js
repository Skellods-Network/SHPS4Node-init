'use strict';

const H = require('../interface/init.h.js');
const libs = require('node-mod-load')('SHPS4Node').libs;


H.halt = function() {
    libs.main.writeLog(
        libs.main.logLevels.warning,
        { mod: 'INIT', msg: 'fixme: implement shutdown' },
        () => process.exit(0)
    );
};
