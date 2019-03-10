/**
 * conjoon
 * dev-cn_mailsim
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/dev-cn_mailsim
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
 * Ext.ux.ajax.SimManager hook for {@link conjoon.dev.cn_mailsim.model.mail.message.ItemAttachment}
 * and {@link conjoon.dev.cn_mailsim.model.mail.message.DraftAttachment}
 * data.
 */
Ext.define('conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.AttachmentSim', {

    requires : [
        'conjoon.dev.cn_mailsim.data.mail.ajax.sim.Init',
        'conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.AttachmentTable',
        'conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable'
    ]

}, function() {

    var AttachmentTable = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.AttachmentTable;

    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url : /cn_mail\/MailAccounts\/(.+)\/MailFolders\/(.+)\/MessageItems\/(.+)\/Attachments(\/.*)?/im,

        doDelete : function(ctx) {

            console.log("DELETE Attachment", ctx.xhr.options);

            let me  = this,
                keys = me.extractCompoundKey(ctx.url),
                ret = {}, found;


            found = AttachmentTable.deleteAttachment(
                keys.mailAccountId, keys.mailFolderId, keys.parentMessageItemId, keys.id);

            ret.responseText = Ext.JSON.encode({
                success :true
            });

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });
            return ret;

        },

        doPost : function(ctx) {

            const me = this;

            let keys       = me.extractCompoundKey(ctx.url),
                attachment = {},
                rec        = {},
                ret        = {};

            console.log("POST Attachment", keys, ctx.xhr.options.records[0].data);

            for (var i in ctx.xhr.options.records[0].data) {
                if (!ctx.xhr.options.records[0].data.hasOwnProperty(i)) {
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

            conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.updateAllItemData(
                keys.mailAccountId,
                keys.mailFolderId,
                keys.parentMessageItemId,
                {hasAttachments : 1}
            );

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            ret.responseText = Ext.JSON.encode({
                data : {
                    id                  : rec.id,
                    parentMessageItemId : rec.parentMessageItemId,
                    mailAccountId       : rec.mailAccountId,
                    mailFolderId        : rec.mailFolderId,
                    success             : true
                }
            });

            return ret;
        },

        data: function(ctx) {
            const me = this;

            let keys = me.extractCompoundKey(ctx.url);

            var id  = keys.id,
                params  = ctx.params,
                filters = params.filter;

            if (id) {

                console.log("GET", "Attachment", id, params.mailAccountId,
                    params.mailFolderId, params.originalMessageItemId, new Date());
                return AttachmentTable.getAttachment(
                    keys.mailAccountId,
                    keys.mailFolderId,
                    keys.parentMessageItemId,
                    keys.id
                );

            } else if (!id)  {

                attachments = AttachmentTable.getAttachments(
                    keys.mailAccountId,
                    keys.mailFolderId,
                    keys.parentMessageItemId
                );
                console.log(
                    "GET", "Attachments for Message id",
                    keys.mailAccountId,
                    keys.mailFolderId,
                    keys.parentMessageItemId,
                    new Date(), attachments
                );
                return attachments;
            } else {
                return [{text : "NOT SUPPORTED"}];
            }
        },

        /**
         * Returns a numeric array with the following values:
         * mailAccountId, mailFolderId, id
         *
         * @param url
         * @returns {*[]}
         */
        extractCompoundKey : function(url) {

            let pt = url.split('/'),
                id = pt.pop().split('?')[0],
                parentMessageItemId, mailFolderId,mailAccountId;

            if (id == 'Attachments') {
                id = undefined;
                pt.push('foo');
            }

            parentMessageItemId = pt.pop();
            parentMessageItemId = pt.pop();
            mailFolderId = pt.pop();
            mailFolderId = pt.pop();
            mailAccountId = pt.pop();
            mailAccountId = pt.pop();

            return {
                mailAccountId : decodeURIComponent(mailAccountId),
                mailFolderId : decodeURIComponent(mailFolderId),
                parentMessageItemId : decodeURIComponent(parentMessageItemId),
                id : id ? decodeURIComponent(id) : undefined
            };
        }
    });

});