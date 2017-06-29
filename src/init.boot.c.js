﻿'use strict';

const path = require('path');

const chalk = require('chalk');
const defer = require('promise-defer');
const nml = require('node-mod-load');
const Main = require(path.dirname(require.main.filename) + '/system/core');
const Result = require('rustify-js').Result;
const Option = require('rustify-js').Option;
const error = require('verror');

const init = require('../interface/init.h.js');


init.boot = function($isDebug = false) {
    const d = defer();

    console.log(chalk.green.bold('\n WELCOME to a world of no worries.\n WELCOME to SHPS!\n'));

    nml.getPackageInfo(path.dirname(require.main.filename)).then($r => {
        console.log(
            `You are starting SHPS v${chalk.cyan.bold($r.version + ' ' + $r.cycle)},`+
            `but please call her ${chalk.cyan.bold($r.internalName)}!`
        );

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
         * @return {string}
         */
        const dmn = $mod => 'SHPS4Node-' + $mod;

        /**
         * Initialize Module
         *
         * @param {string} $mod full module name
         * @return {Result}
         */
        const _init = $mod => {
            (
                nmlGlobal.libs.coml
                    ? nmlGlobal.libs.coml.writeLn
                    : console.log
            ).apply(nmlGlobal.libs.coml, [`Initialize module ${$mod}...`]);

            const mod = require($mod);

            if (Option.fromGuess(mod).isNone()) {
                return Result.fromError(new global.VError({
                    name: 'Module Not Found',
                    cause: new Error('Could not find module ' + $mod.toString()),
                    info: {
                        errno: 'EMODNOTFOUND',
                    },
                }));
            }

            if (typeof mod.init === 'function') {
                return mod.init();
            }

            return Result.fromSuccess(mod);
        };

        const nmlGlobal = nml('SHPS4Node');
        const mods2init = [];
        const initializedMods = [];
        const modules = [
            'auth',
            'cache',
            ['commandline', 'coml'],
            'config',
            ['dependency', 'dep'],
            'error',
            ['language', 'lang'],
            // 'log',
            'optimize',
            'parallel',
            'plugin',
            'sandbox',
            'schedule',
            'session',
            'SQL',
        ];

        nmlGlobal.addMeta('main', new Main($isDebug));
        if (!init.init().orElse($e => {
                d.reject($e);

                return false;
            })) {
            return;
        }

        if (!Main.init().orElse($e => {
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

            (
                nmlGlobal.libs.coml
                    ? nmlGlobal.libs.coml.writeLn
                    : console.log
            ).apply(nmlGlobal.libs.coml, [`Load module ${fmn}...`]);

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
                } else {
                    mods2init.push(mod);
                }
            } else {
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
                d.reject(new global.VError({
                    name: 'Circular Dependencies Detected',
                    cause: new Error('Circular init-dependencies in SHPS modules detected!'),
                    info: {
                        errno: 'ECIRCULARDEPS',
                        mods: mods2init,
                    },
                }));

                break;
            }
        }

        nmlGlobal.libs.coml.write('\nI am done booting SHPS!\n');

        d.resolve(init);
    }, d.reject);

    return d.promise;
};
