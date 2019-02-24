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
 *
 */
Ext.define('conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.AttachmentTable', {

    singleton : true,

    attachments : null,

    largestAttachmentId : 0,

    getRandom : function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    moveAttachments : function(mailAccountId, mailFolderId, parentMessageItemId, moveInfo) {

        const me     = this,
              key    = [mailAccountId, mailFolderId, parentMessageItemId].join('-'),
              newKey = [
                  mailAccountId,
                  moveInfo.mailFolderId ? moveInfo.mailFolderId : mailFolderId,
                  parentMessageItemId
              ].join('-');

        if (key === newKey) {
            return;
        }

        let attachments;

        if (!me.attachments) {
            me.attachments = {};
        }

        if (!me.attachments[key]) {
            return;
        }


        if (me.attachments[newKey]) {
            Ext.raise("Unexpected error: attachments existing for " + newKey);
        }

        attachments = me.attachments[key];

        delete me.attachments[key];


        me.attachments[newKey] = attachments;

        for (let i = 0, len = me.attachments[newKey].length; i < len; i++) {
            me.attachments[newKey][i]['mailFolderId'] = moveInfo.mailFolderId;
        }

        return me.attachments[newKey];

    },

    createAttachment : function(mailAccountId, mailFolderId, parentMessageItemId, attachmentData) {

        var me            = this,
            key           =  mailAccountId + '-' + mailFolderId + '-' + parentMessageItemId;

        if (!me.attachments) {
            me.attachments = {};
        }

        if (!me.attachments[key]) {
            me.attachments[key] = [];
        }

        attachmentData.id = ++me.largestAttachmentId;

        me.attachments[key].push(attachmentData);

        conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.updateAllItemData(
            mailAccountId, mailFolderId, parentMessageItemId, {}
        );

        return attachmentData;
    },

    deleteAttachment : function(mailAccountId, mailFolderId, parentMessageItemId, id) {

        if (arguments.length < 4) {
            Ext.raise("Unexpected missing arguments.");
        }


        let me  = this,
            key = mailAccountId + '-' + mailFolderId + '-' + parentMessageItemId,
            found = 0;

        if (!me.attachments) {
            me.attachments = {};
        }

        if (me.attachments[key]) {
            let attach = me.attachments[key];
            for (let i = attach.length - 1; i >= 0; i--) {
                if (attach[i].id == id) {
                    found++;
                    attach.splice(i, 1);
                }
            }
        }

        if (found > 0) {
            conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.updateAllItemData(
                mailAccountId, mailFolderId, parentMessageItemId, {});
            if (me.attachments[key].length == 0) {
                me.attachments[key] = null;
            }
        }

        return found;
    },


    getAttachments : function(mailAccountId, mailFolderId, parentMessageItemId) {
        var me         = this,
            attachments = null,
            rec,
            key = mailAccountId + '-' + mailFolderId + '-' + parentMessageItemId;

        let wasEmpty = false;

        if (!me.attachments) {
            wasEmpty = true;
            me.attachments = {};
        }

        if (me.attachments.hasOwnProperty(key)) {
            return me.attachments[key];
        }

        return null;
    },


    createRandomAttachments : function(mailAccountId, mailFolderId, parentMessageItemId) {

        const me = this,
              key = [mailAccountId, mailFolderId, parentMessageItemId].join('-');

        let attachmentNames = [
                "IMG3701",
                "documents",
                "REPOSITORYPARTSTUFF_packed.type.full7897",
                "images",
                "architecture_draft"
            ],
            attachmentTypes = [
                {type : 'application/pdf', extension : 'pdf'},
                {type : 'image/jpg',       extension : 'jpg'},
                {type : 'application/x-rar-compressed', extension : 'rar'},
                {type : 'application/zip', extension : 'zip'},
                {type : 'text/plain', extension : 'txt'}
            ],
            attachmentSizes = [
                '24233',
                '23532553253',
                '6588668',
                '23434',
                '46337773'
            ], rec;

        if (!me.attachments) {
            me.attachments = {};
        }


        for (var i = 0, len = me.getRandom(0, 5); i < len; i++) {

            if (!me.attachments[key]) {
                me.attachments[key] = [];
            }

            rec = {
                id                  : ++me.largestAttachmentId,
                parentMessageItemId : parentMessageItemId,
                mailFolderId        : mailFolderId,
                mailAccountId       : mailAccountId,
                text                : attachmentNames[me.getRandom(0, 4)] + '.' +
                attachmentTypes[me.getRandom(0, 4)].extension,
                type                : attachmentTypes[me.getRandom(0, 4)].type,
                size                : attachmentSizes[me.getRandom(0, 4)]
            };

            me.attachments[key].push(rec);
        }


        return me.attachments[key];

    },


    getAttachmentAt : function(pos) {

        const me = this;

        let ind = 0;

        for (let messageItemId in me.attachments) {
            for (let i = 0, len = me.attachments[messageItemId].length; i < len; i++) {
                if (ind === pos) {
                    return me.attachments[messageItemId][i];
                }
                ind++;
            }
        }

        return null;
    },


    getAttachment : function(mailAccountId, mailFolderId, parentMessageItemId, attachmentId) {

        var me            = this,
            messageItemId = parentMessageItemId,
            key           = mailAccountId + '-' + mailFolderId + '-' + parentMessageItemId;

        if (!me.attachments) {
            me.attachments = {};
        }


        if (me.attachments[key]) {
            for (var i = 0, len = me.attachments[key].length; i < len; i++) {
                if (me.attachments[key][i].id == attachmentId) {
                    return me.attachments[key][i];
                }
            };
        }

        return null;
    },

    resetAll : function() {
        const me = this;

        me.attachments = null;

        me.largestAttachmentId = 0;

    }


});