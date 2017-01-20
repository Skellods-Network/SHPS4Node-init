'use strict';

/**
 * Booststrapper module for SHPS
 */
module.exports = class Init {

    /**
     * Initialize all SHPS modules
     *
     * @result Promise
     */
    static boot() { }

    /**
     * Shuts SHPS down
     * !!! ATTENTION !!!
     * SHPS will stop! It will no longer serve any content and it will not restart on its own
     * Only call this method when you really want to exit SHPS
     * Don't come running the me. I warned you!
     *
     * @result Promise
     */
    static shutdown() { }

    /**
     * Initializes this module
     * Must safely initialize the module, even after restarts
     * Attention: Module might not work when not initialized
     *
     * @result Promise
     */
    static init() { }

    /**
     * Shuts the module down
     * Must safely shut down the module so that it works even when restarted
     * Attention: Module might not work when shut down!
     *
     * @result Promise
     */
    static halt() { }
};
