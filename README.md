# SHPS4Node-init
SHPS4Node Boot/Shutdown Lifecycle System Module


# Interface

```js
/**
 * Boost module for SHPS
 */
module.exports = class Init {

    /**
     * Initialize all SHPS modules
     *
     * @returns {Promise<Init, VError>}
     */
    static boot() { }

    /**
     * Shuts SHPS down
     * !!! ATTENTION !!!
     * SHPS will stop! It will no longer serve any content and it will not restart on its own
     * Only call this method when you really want to exit SHPS
     * Don't come running the me. I warned you!
     *
     * @returns {Promise<Init, VError>}
     */
    static shutdown() { }

    /**
     * Initializes this module
     * Must safely initialize the module, even after restarts
     * Attention: Module might not work when not initialized
     *
     * @returns {Result<Init>}
     */
    static init() { }

    /**
     * Shuts the module down
     * Must safely shut down the module so that it works even when restarted
     * Attention: Module might not work when shut down!
     *
     * @returns {Result<Init>}
     */
    static halt() { }
};
```
