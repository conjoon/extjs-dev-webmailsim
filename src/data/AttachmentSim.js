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
 * JsonSimlet for Attachment-data.
 */
Ext.define("conjoon.dev.cn_mailsim.data.AttachmentSim", {

    extend: "Ext.ux.ajax.JsonSimlet",

    requires: [
        "conjoon.dev.cn_mailsim.data.table.AttachmentTable",
        "conjoon.dev.cn_mailsim.data.table.MessageTable"
    ],

    doDelete: function (ctx) {

        const AttachmentTable = conjoon.dev.cn_mailsim.data.table.AttachmentTable;

        /* eslint-disable-next-line no-console*/
        console.log("DELETE Attachment", ctx.xhr.options);

        let me = this,
            keys = me.extractCompoundKey(ctx.url),
            ret = {},
            itemData,
            retVal;
        itemData = false;
        if (itemData !== false) {
            itemData = AttachmentTable.deleteAttachment(
                keys.mailAccountId, keys.mailFolderId, keys.parentMessageItemId, keys.id);
        }

        if (itemData === false) {
            retVal = {
                success: false
            };
        } else {
            retVal = {
                success: true,
                data: {
                    id: keys.id,
                    parentMessageItemId: itemData.parentMessageItemId,
                    mailAccountId: itemData.mailAccountId,
                    mailFolderId: itemData.mailFolderId
                }
            };
        }

        ret.responseText = Ext.JSON.encode(retVal);

        Ext.Array.forEach(me.responseProps, function (prop) {
            if (prop in me) {
                ret[prop] = me[prop];
            }
        });

        /* eslint-disable-next-line no-console*/
        console.log("DELETING ATTACHMENT, response: ", retVal);
        return ret;

    },

    doPost: function (ctx) {

        const
            me = this,
            AttachmentTable = conjoon.dev.cn_mailsim.data.table.AttachmentTable;

        let keys       = me.extractCompoundKey(ctx.url),
            attachment = {},
            rec        = {},
            ret        = {};

        /* eslint-disable-next-line no-console*/
        console.log("POST Attachment", keys, ctx.xhr.options.records[0].data);

        for (var i in ctx.xhr.options.records[0].data) {
            if (!Object.prototype.hasOwnProperty.call(ctx.xhr.options.records[0].data, i)) {
                continue;
            }

            attachment[i] = ctx.xhr.options.records[0].data[i];
        }

        rec = AttachmentTable.createAttachment(
            keys.mailAccountId,
            keys.mailFolderId,
            keys.parentMessageItemId,
            attachment
        );

        conjoon.dev.cn_mailsim.data.table.MessageTable.updateAllItemData(
            rec.mailAccountId,
            rec.mailFolderId,
            rec.parentMessageItemId,
            {hasAttachments: 1}
        );

        Ext.Array.forEach(me.responseProps, function (prop) {
            if (prop in me) {
                ret[prop] = me[prop];
            }
        });

        let retVal = {
            data: {
                id: rec.id,
                parentMessageItemId: rec.parentMessageItemId,
                mailAccountId: rec.mailAccountId,
                mailFolderId: rec.mailFolderId,
                success: true
            }
        };

        ret.responseText = Ext.JSON.encode(retVal);

        /* eslint-disable-next-line no-console*/
        console.log("POSTED Attachment, response: ", retVal);
        return ret;
    },

    data: function (ctx) {
        const
            me = this,
            AttachmentTable = conjoon.dev.cn_mailsim.data.table.AttachmentTable;

        let keys = me.extractCompoundKey(ctx.url);

        var id  = keys.id,
            params  = ctx.params;

        if (id) {

            /* eslint-disable-next-line no-console*/
            console.log("GET", "Attachment", id, params.mailAccountId,
                params.mailFolderId, params.originalMessageItemId, new Date());
            return AttachmentTable.getAttachment(
                keys.mailAccountId,
                keys.mailFolderId,
                keys.parentMessageItemId,
                keys.id
            );

        } else if (!id)  {

            let attachments = AttachmentTable.getAttachments(
                keys.mailAccountId,
                keys.mailFolderId,
                keys.parentMessageItemId
            );

            /* eslint-disable-next-line no-console*/
            console.log(
                "GET", "Attachments for Message id",
                keys.mailAccountId,
                keys.mailFolderId,
                keys.parentMessageItemId,
                new Date(), attachments
            );
            return attachments;
        } else {
            return [{text: "NOT SUPPORTED"}];
        }
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
            id = pt.pop().split("?")[0],
            parentMessageItemId, mailFolderId,mailAccountId;

        if (id === "Attachments") {
            id = undefined;
            pt.push("foo");
        }

        parentMessageItemId = pt.pop();
        parentMessageItemId = pt.pop();
        mailFolderId = pt.pop();
        mailFolderId = pt.pop();
        mailAccountId = pt.pop();
        mailAccountId = pt.pop();

        return {
            mailAccountId: decodeURIComponent(mailAccountId),
            mailFolderId: decodeURIComponent(mailFolderId),
            parentMessageItemId: decodeURIComponent(parentMessageItemId),
            id: id ? decodeURIComponent(id) : undefined
        };
    }

});