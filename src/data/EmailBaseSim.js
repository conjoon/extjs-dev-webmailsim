/**
 * conjoon
 * extjs-dev-webmailsim
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-dev-webmailsim
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * BaseSimlet.
 */
Ext.define("conjoon.dev.cn_mailsim.data.EmailBaseSim", {

    extend: "Ext.ux.ajax.JsonSimlet",

    inheritableStatics: {
        required: {
            simletAdapter: "conjoon.dev.cn_mailsim.data.SimletAdapter"
        }
    },

    /**
     * @type {conjoon.dev.cn_mailsim.data.SimletAdapter} simletAdapter
     * @private
     */


    /**
     *
     * @param uri
     * @returns {URL}
     */
    uriToUrl (uri) {

        let url;
        try {
            url = new URL(url);
        } catch (e) {
            url = new URL(url, window.location);
        }

        return url;
    },


    exec: function (xhr) {

        const
            me = this,
            res = me.simletAdapter.validateRequest(xhr);

        if (res !== null) {
            return res;
        }


        return me.callParent(arguments);
    }

});
