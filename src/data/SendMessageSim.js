/**
 * conjoon
 * extjs-dev-webmailsim
 * Copyright (C) 2019-2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-dev-webmailsim
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
 * JsonSimlet for sending MessageDrafts.
 */
Ext.define("conjoon.dev.cn_mailsim.data.SendMessageSim", {

    extend: "Ext.ux.ajax.JsonSimlet",

    requires: [
        "conjoon.dev.cn_mailsim.data.table.MessageTable"
    ],

    doPost: function (ctx) {

        /* eslint-disable-next-line no-console*/
        console.log("POST SendMessage", ctx.xhr.options);

        var me              = this,
            ret             = {},
            MessageTable    = conjoon.dev.cn_mailsim.data.table.MessageTable,
            id              = ctx.xhr.options.params.id,
            mailAccountId   = ctx.xhr.options.params.mailAccountId,
            mailFolderId    = ctx.xhr.options.params.mailFolderId,
            draft           = MessageTable.getMessageDraft(mailAccountId, mailFolderId, id);


        if (draft.xCnDraftInfo) {
            let [accountId, folderId, id] = Ext.decode(atob(draft.xCnDraftInfo));
            let items = MessageTable.getMessageItems();
            for (let i in items) {
                if (items[i].mailAccountId === accountId && items[i].id === id &&
                    items[i].mailFolderId === folderId) {
                    MessageTable.updateAllItemData(
                        items[i].mailAccountId, items[i].mailFolderId, items[i].id,
                        {answered: true});
                    break;
                }
            }
        }

        if (draft.subject === "SENDFAIL") {
            ret.responseText = Ext.JSON.encode({
                success: false
            });
            return ret;
        }

        Ext.Array.forEach(me.responseProps, function (prop) {
            if (prop in me) {
                ret[prop] = me[prop];
            }
        });

        ret.responseText = Ext.JSON.encode({
            success: true
        });

        return ret;
    }

});