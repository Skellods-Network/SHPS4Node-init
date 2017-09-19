'use strict';

const Result = require('result-js');
const VError = require('verror');

const h = require('../interface/init.h.js');


h.init = function () {

    if (h._running) {

        return Result.fromError(new VError.VError('SHPS is already running!'));
    }

    h._running = true;
    return Result.fromSuccess(h);
};
