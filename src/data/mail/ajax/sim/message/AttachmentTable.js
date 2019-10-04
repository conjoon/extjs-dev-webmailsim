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
                  moveInfo.parentMessageItemId ? moveInfo.parentMessageItemId : parentMessageItemId
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

        for (var i in me.attachments[newKey]) {
            if (!me.attachments[newKey].hasOwnProperty(i)) {
                continue;
            }
            if (moveInfo.mailFolderId) {
                me.attachments[newKey][i]['mailFolderId'] = moveInfo.mailFolderId;
            }
            if (moveInfo.parentMessageItemId) {
                me.attachments[newKey][i]['parentMessageItemId'] = moveInfo.parentMessageItemId;
            }
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

        let itemData = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.updateAllItemData(
            mailAccountId, mailFolderId, parentMessageItemId, {}, true
        );
if (!itemData)debugger;
        me.moveAttachments(mailAccountId, mailFolderId, parentMessageItemId, {
            parentMessageItemId : itemData.id
        });

        return Ext.apply(attachmentData, {
            mailAccountId       : itemData.mailAccountId,
            mailFolderId        : itemData.mailFolderId,
            parentMessageItemId : itemData.id
        });
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

        for (let a in me.attachments) {
            let attChilds = me.attachments[a];

            for (let i in attChilds) {
                let att = attChilds[i];
                if (att.parentMessageItemId == parentMessageItemId &&
                    att.mailFolderId == mailFolderId &&
                    att.mailAccountId == mailAccountId &&
                    att.id == id) {
                    found = 1;
                    delete me.attachments[a][i];
                    break;
                }
            }
        }

        /*
        if (me.attachments[key]) {
            let attach = me.attachments[key];
            for (var i in attach) {
                if (!attach.hasOwnProperty(i)) {
                    continue;
                }
                if (attach[i].id == id) {
                    found++;
                    delete attach[i];
                }
            }
        }*/

        if (found > 0) {
            let itemData = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.updateAllItemData(
                mailAccountId, mailFolderId, parentMessageItemId, {}, true);

            me.moveAttachments(mailAccountId, mailFolderId, parentMessageItemId, {parentMessageItemId : itemData.id});

            return {
                parentMessageItemId : itemData.id,
                mailAccountId       : itemData.mailAccountId,
                mailFolderId        : itemData.mailFolderId,
            };
        }

        return false;

    },



    getAttachments : function(mailAccountId, mailFolderId, parentMessageItemId) {
        var me         = this,
            attachments = null,
            rec,
            key = mailAccountId + '-' + mailFolderId + '-' + parentMessageItemId;

        let wasEmpty = false;

        if (!me.attachments) {
            me.attachments = {};
        }

        let result = null;

        for (var a in me.attachments) {
            if (!me.attachments.hasOwnProperty(a)) {
                continue;
            }

            for (var i in me.attachments[a]) {
                if (!me.attachments[a].hasOwnProperty(i)) {
                    continue;
                }
                if (me.attachments[a][i].mailAccountId === mailAccountId &&
                    me.attachments[a][i].mailFolderId === mailFolderId &&
                    me.attachments[a][i].parentMessageItemId === parentMessageItemId) {
                    if (result === null) {
                        result = [];
                    }

                    result.push(me.attachments[a][i]);
                }
            }


        }

        return result;
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
            if (!me.attachments.hasOwnProperty(messageItemId)) {
                continue;
            }
            for (let i in me.attachments[messageItemId]) {
                if (!me.attachments[messageItemId].hasOwnProperty(i)) {
                    continue;
                }
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

        for (var a in me.attachments) {
            if (!me.attachments.hasOwnProperty(a)) {
                continue;
            }

            for (var i in me.attachments[a]) {
                if (!me.attachments[a].hasOwnProperty(i)) {
                    continue;
                }
            }

            if (me.attachments[a][i].mailAccountId === mailAccountId &&
                me.attachments[a][i].mailFolderId === mailFolderId &&
                me.attachments[a][i].parentMessageItemId === parentMessageItemId &&
                me.attachments[a][i].id === attachmentId) {
                return me.attachments[a][i];
            }
        }

        return null;
    },

    resetAll : function() {
        const me = this;

        me.attachments = null;

        me.largestAttachmentId = 0;

    }


});