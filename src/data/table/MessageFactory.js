/**
 * conjoon
 * extjs-dev-webmailsim
 * Copyright (C) 2020-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-dev-webmailsim
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
 *
 */
Ext.define("conjoon.dev.cn_mailsim.data.table.MessageFactory", {

    singleton: true,

    messages: null,
    rawMessages: null,

    requires: [
        "coon.core.Environment"
    ],

    getMessage (id) {

        const me = this;

        if (!me.messages) {
            me.messages = {};
        }

        if (!me.messages[id]) {
            if (!coon.core.Environment.getVendorBase()) {
                me.messages[id] = "No VendorBase configured.";
            } else {
                me.messages[id] = Ext.Ajax.request({
                    async: false,
                    url: coon.core.Environment.getPathForResource(`resources/templates/email_${id}.html`, "extjs-dev-webmailsim")
                }).responseText;
            }
        }
        return me.messages[id];
    },


    getRawMessage (id) {

        const me = this;

        if (!me.rawMessages) {
            me.rawMessages = {};
        }

        if (!me.rawMessages[id]) {
            if (!coon.core.Environment.getVendorBase()) {
                me.rawMessages[id] = "No VendorBase configured.";
            } else {
                me.rawMessages[id] = Ext.Ajax.request({
                    async: false,
                    url: coon.core.Environment.getPathForResource(`resources/templates/email_${id}.txt`, "extjs-dev-webmailsim")
                }).responseText;
            }
        }


        return me.rawMessages[id];
    }

});