/**
 * conjoon
 * extjs-dev-webmailsim
 * Copyright (C) 2019-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-dev-webmailsim
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
 * JsonSimlet for MailFolder-data.
 */
Ext.define("conjoon.dev.cn_mailsim.data.MailFolderSim", {

    extend: "Ext.ux.ajax.JsonSimlet",

    requires: [
        "conjoon.dev.cn_mailsim.data.table.MailFolderTable"
    ],

    getMockFolder: () => conjoon.dev.cn_mailsim.data.table.MailFolderTable.getFolders(),


    doGet: function (ctx) {

        const me            = this,
            keys = me.extractCompoundKey(ctx.url),
            mailAccountId = keys.mailAccountId;

        let ret = {};

        let mailFolders = Ext.Array.filter(
            me.getMockFolder(),
            function (item) {
                return item.relationships.MailAccount.data.id === "" + mailAccountId;
            }
        );


        ret.responseText = Ext.JSON.encode({
            data: mailFolders
        });

        Ext.Array.forEach(me.responseProps, function (prop) {
            if (prop in me) {
                ret[prop] = me[prop];
            }
        });

        return ret;
    },


    /**
     * Returns a numeric array with the following values:
     * mailAccountId, mailFolderId, id
     *
     * @param url
     * @returns {*[]}
     */
    extractCompoundKey: function (url) {

        let pt = url.split("/"),
            mailAccountId;

        pt.pop();
        mailAccountId = pt.pop();

        return {
            mailAccountId: decodeURIComponent(mailAccountId)
        };
    }


});
