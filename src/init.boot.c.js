'use strict';

const path = require('path');

const chalk = require('chalk');
const defer = require('promise-defer');
const nml = require('node-mod-load');
const main = require(path.dirname(require.main.filename) + '/system/core');
const Result = require('result-js');
const error = require('verror');

const init = require('../interface/init.h.js');


init.boot = function ($isDebug = false) {

    const d = defer();

    console.log(chalk.green.bold('\n WELCOME to a world of no worries.\n WELCOME to SHPS!\n'));

    nml.getPackageInfo(path.dirname(require.main.filename)).then($r => {

        console.log(`You are starting SHPS v${chalk.cyan.bold($r.version + ' ' + $r.cycle)}, but please call her ${chalk.cyan.bold($r.internalName)}!`);
        console.log('Please wait while I boot SHPS... it won\'t take long ;)\n');

        console.log('Prepare environment...');
        global.VError = error.VError;
        global.WError = error.WError;
        global.SError = error.SError;
        global.MultiError = error.MultiError;


        console.log('Boot SHPS...');

        /**
         * Decorate Module Name
         * for abbreviating module names
         *
         * @param {string} $mod
         * @returns {string}
         */
        const dmn = $mod => 'SHPS4Node-' + $mod;

        /**
         * Initialize Module
         *
         * @param {string} $mod full module name
         * @returns {Result}
         */
        const _init = $mod => {

            nmlGlobal.libs.coml
                ? nmlGlobal.libs.coml.write(`Initialize module ${$mod}...`)
                : console.log(`Initialize module ${$mod}...`);

            if (require($mod) instanceof main.mixins.init) {

                return require($mod).init();
            }

            return Result.fromSuccess(require($mod));
        };

        const nmlGlobal = nml('SHPS4Node');
        const mods2init = [];
        const initializedMods = [];
        const modules = [
            'auth',
            'cache',
            ['commandline', 'coml'],
            'config',
            'cookie',
            'CSS',
            ['dependency', 'dep'],
            'error',
            'file',
            'frontend',
            ['language', 'lang'],
            //'log',
            'make',
            'optimize',
            'parallel',
            'plugin',
            'sandbox',
            'schedule',
            'session',
            'SQL',
        ];

        nmlGlobal.addMeta('main', new main($isDebug));
        if (!init.init().orElse($e => {

                d.reject($e);
                return false;
            })) {

            return;
        }

        if (!main.init().orElse($e => {

                d.reject($e);
                return false;
            })) {

            return;
        }

        nmlGlobal.addMeta('init', init);
        for (let iMod of modules) {

            let mod = Array.isArray(iMod)
                ? iMod[0]
                : iMod;

            let fmn = dmn(mod);
            nmlGlobal.addMeta(mod, require(fmn));
            if (nml(fmn).info.init) {

                let canInit = true;
                for (let dep of nml(fmn).info.init) {

                    if (!initializedMods.includes(dep)) {

                        canInit = false;
                        break;
                    }
                }

                if (canInit) {

                    let obj = _init(fmn).orElse($e => {

                        d.reject($e);
                        return false;
                    });

                    if (typeof obj === 'boolean') {

                        return;
                    }

                    nmlGlobal.addMeta(mod, obj);
                    if (Array.isArray(iMod)) {

                        nmlGlobal.addMeta(iMod[1], obj);
                    }

                    initializedMods.push(mod);
                }
                else {

                    mods2init.push(mod);
                }
            }
            else {

                let obj = _init(fmn).orElse($e => {

                    d.reject($e);
                    return false;
                });

                if (typeof obj === 'boolean') {

                    return;
                }

                nmlGlobal.addMeta(mod, obj);
                if (Array.isArray(iMod)) {

                    nmlGlobal.addMeta(iMod[1], obj);
                }

                initializedMods.push(mod);
            }
        }

        let numActions = 0;
        while (mods2init.length > 0) {

            for (let iMod of modules) {

                let mod = Array.isArray(iMod)
                    ? iMod[0]
                    : iMod;

                let fmn = dmn(mod);
                if (nml(fmn).info.init) {

                    let canInit = true;
                    for (let dep of nml(fmn).info.init) {

                        if (!initializedMods.includes(dep)) {

                            canInit = false;
                            break;
                        }
                    }

                    if (canInit) {

                        let obj = _init(fmn).orElse($e => {

                            d.reject($e);
                            return false;
                        });

                        if (typeof obj === 'boolean') {

                            return;
                        }

                        nmlGlobal.addMeta(mod, obj);
                        if (Array.isArray(iMod)) {

                            nmlGlobal.addMeta(iMod[1], obj);
                        }

                        initializedMods.push(mod);
                        mods2init.splice(mods2init.indexOf(mod), 1);
                        numActions++;
                    }
                }
            }

            if (numActions <= 0) {

                d.reject(new VError({

                    info: {
                        mods: mods2init,
                    },
                }, 'Circular init-dependencies in SHPS modules detected!'));

                break;
            }
        }

        console.log(nmlGlobal.libs.coml.write('\nI am done booting SHPS!\n'));

        d.resolve(init);
    }, d.reject);

    return d.promise;
};
