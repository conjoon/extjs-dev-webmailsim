/**
 * conjoon
 * extjs-dev-webmailsim
 * Copyright (C) 2020 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-dev-webmailsim
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
 * Ext.ux.ajax.SimManager hook for {@link conjoon.dev.cn_mailsim.model.mail.message.MessageItem}
 * data.
 */
Ext.define('conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageItemSim', {

    requires : [
        'conjoon.dev.cn_mailsim.data.mail.ajax.sim.Init',
        'conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable'
    ]

}, function() {

    const MessageTable = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable;

    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url : /cn_mail\/MailAccounts\/(.+)\/MailFolders\/(.+)\/MessageItems(\/.*)?/im,

        doDelete : function(ctx) {

            const me  = this,
                  keys = me.extractCompoundKey(ctx.url),
                  target =  ctx.params.target;

            if (target === 'MessageBody') {
                Ext.raise("Not implemented");
            }

            console.log("DELETE MessageItem - ", target, keys);

            let ret = {}, found = false,
                id = keys.id,
                mailAccountId = keys.mailAccountId,
                mailFolderId = keys.mailFolderId;

            if (!id) {
                console.log("DELETE MessageItem - no numeric id specified.");
                return {success : false};
            }

            let messageItems = MessageTable.getMessageItems(), mi;

            for (var i in messageItems) {
                mi = messageItems[i];
                if (mi.id === id && mi.mailFolderId === mailFolderId &&
                    mi.mailAccountId === mailAccountId) {
                    delete messageItems[i];
                    found = true;
                    break;
                }
            }

            if (!found) {
                return {success : false};
            }

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            ret.responseText = Ext.JSON.encode({success : true});


            Ext.apply(me, ret);
            return ret;
        },



        doPost : function(ctx) {

            let target = ctx.params.target;

            if (target === "MessageItem") {
                console.error("POSTing MessageItem - this should only happen in tests");
                return;
            }

            if (ctx.params.target === 'MessageBodyDraft') {
                return this.postMessageBody(ctx);
            }

            if (ctx.params.target !== 'MessageDraft') {
                Ext.raise("Invalid target parameter: " + ctx.params.target);
            }

            // MessageDraft
            console.log("POST MessageDraft", ctx, ctx.xhr.options.jsonData);

            var me            = this,
                draft         = {},
                ret           = {},
                MessageTable  = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable;

            for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }

                if (i == 'to' || i == 'cc' || i == 'bcc') {
                    draft[i] = Ext.JSON.decode(ctx.xhr.options.jsonData[i]);
                } else {
                    draft[i] = ctx.xhr.options.jsonData[i];
                }
            }

            if (draft['subject'] === 'TESTFAIL') {
                ret.responseText = Ext.JSON.encode({
                    success : false
                });
                return ret;
            }

            draft = MessageTable.createMessageDraft(draft.mailAccountId, draft.mailFolderId, draft);

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            ret.responseText = Ext.JSON.encode({
                success: true,
                data : {
                    id: draft.id,
                    mailFolderId: draft.mailFolderId,
                    mailAccountId: draft.mailAccountId
                }});

            return ret;

        },




        doPut : function(ctx) {

            var me           = this,
                keys         = me.extractCompoundKey(ctx.url),
                ret          = {},
                MessageTable = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable,
                values       = {},
                result,
                target = ctx.params.target;

            if (["MessageBodyDraft", "MessageItem", "MessageDraft"].indexOf(target) === -1) {
                Ext.raise("Invalid target parameter: " + target);
            }

            if (["MessageBodyDraft", "MessageItem"].indexOf(target) !== -1) {
                for (var i in ctx.xhr.options.jsonData) {
                    if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                        continue;
                    }
                    values[i] = ctx.xhr.options.jsonData[i];
                }

                console.log("PUT " + target, values);


                if (target === 'MessageBodyDraft') {
                    result = MessageTable.updateMessageBody(keys.mailAccountId, keys.mailFolderId, keys.id, values);
                } else {
                    result = MessageTable.updateMessageItem(keys.mailAccountId, keys.mailFolderId, keys.id, values);
                }

                Ext.Array.forEach(me.responseProps, function (prop) {
                    if (prop in me) {
                        ret[prop] = me[prop];
                    }
                });

                let retVal = {
                    success: true,
                    data: result
                };
                ret.responseText = Ext.JSON.encode(retVal);

                console.log("PUT " + target + ", response: ", retVal)

                return ret;
            }


            // This is where we trigger an idchange
            console.log("PUT MessageDraft", ctx.xhr.options.jsonData);

            // MESSAGE DRAFT

            ret           = {};
            MessageTable  = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable;
            values        = {};
            keys          = me.extractCompoundKey(ctx.url);

            for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }
                values[i] = ctx.xhr.options.jsonData[i];
            }

            if (values['subject'] === 'TESTFAIL') {
                ret.responseText = Ext.JSON.encode({
                    success : false
                });
                return ret;

            }

            let updatedDraft = MessageTable.updateMessageDraft(
                keys.mailAccountId,
                keys.mailFolderId,
                keys.id,
                values,
                true
            );

            let draft = MessageTable.getMessageDraft(
                updatedDraft.mailAccountId,
                updatedDraft.mailFolderId,
                updatedDraft.id
            );

            delete values.localId;

            for (var i in values) {
                if (draft[i]) {
                    values[i] = draft[i];
                }
            }

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            ret.responseText = Ext.JSON.encode({
                success: true,
                data : values
            });

            console.log("PUT MessageDraft, response: ", values);

            return ret;


        },



        data : function(ctx) {

            var me = this,
                keys = me.extractCompoundKey(ctx.url),
                idPart  = ctx.url.match(this.url)[1],
                filters = ctx.params.filter,
                id,
                MessageTable = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable,
                messageItems = MessageTable.getMessageItems();

            if (["MessageBodyDraft", "MessageItem", "MessageBody", "MessageDraft"].indexOf(ctx.params.target) === -1) {
                Ext.raise("Invalid target parameter: " + ctx.params.target);
            }

            if (ctx.params.target === 'MessageBody') {

                console.log("GET MessageBody ", ctx.url, keys);
                return this.getMessageBody(keys.mailAccountId, keys.mailFolderId, keys.id);
            }

            if (ctx.params.target === 'MessageBodyDraft') {

                console.log("GET MessageBodyDraft ", ctx.url, keys);
                return this.getMessageBody(keys.mailAccountId, keys.mailFolderId, keys.id, true);
            }

            if (ctx.params.target === 'MessageDraft') {

                console.log("GET MessageDraft ", ctx.url);

                var me = this,
                    ret = {},
                    idPart  = ctx.url.match(this.url)[1],
                    filters = ctx.params.filter,
                    mailAccountId, mailFolderId, id,
                    MessageTable  = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable,
                    messageDrafts;

                let keys = me.extractCompoundKey(ctx.url);

                mailAccountId = keys.mailAccountId,
                    mailFolderId  = keys.mailFolderId,
                    id            = keys.id;

                let fitem = MessageTable.getMessageDraft(mailAccountId, mailFolderId, id);

                Ext.Array.forEach(me.responseProps, function (prop) {
                    if (prop in me) {
                        ret[prop] = me[prop];
                    }
                });

                let retVal = null;
                if (!fitem) {

                    retVal = {
                        success : false
                    };

                    //ret.status = "404";
                    //ret.statusText = "Not Found";
                    //return ret;
                } else {
                    retVal = {
                        success : true,
                        data    : fitem
                    };
                }

                console.log("GET MessageDraft, response ", ctx.url);

                return retVal;
            }



            if (keys.id) {
                id = keys.id;

                let item;
                for (let i in messageItems) {
                    let messageItem = messageItems[i];
                    if (messageItem.mailAccountId === keys.mailAccountId &&
                        messageItem.mailFolderId === keys.mailFolderId &&
                        messageItem.id === '' + id) {
                        item = messageItem;
                        break;
                    }
                }

                if (!item) {
                    return {status : 404, success : false};
                }

                return {data : item};

            } else if (!id) {

                var items = [];
                for (let i in messageItems) {
                    let messageItem = messageItems[i];
                    if (messageItem.mailAccountId === keys.mailAccountId &&
                    messageItem.mailFolderId === keys.mailFolderId) {
                        items.push(messageItem);
                    }
                }

                return items;
            } else {
                return messageItems;
            }
        },

        getMessageBody : function(mailAccountId, mailFolderId, id, isDraft = false) {

            let retVal;

            if (conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.peekMessageBody(
                    mailAccountId,
                    mailFolderId,
                    id
                )) {

                retVal = {success : true, data : conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable
                        .getMessageBody(
                            mailAccountId,
                            mailFolderId,
                            id
                        )};

                let entity = isDraft ? "MessageBodyDraft" : "MessageBody";

                console.log("GET " + entity + ", response, ", retVal);

                return retVal
            }

            retVal = {success : false};
            console.log("GET MessageBody, response, ", retVal);
            return retVal;

        },


        postMessageBody : function(ctx) {

            console.log("POST MessageBodyDraft", ctx.xhr.options.jsonData);

            var me    = this,
                body  = {},
                ret   = {},
                newRec;

            for (var i in ctx.xhr.options.jsonData) {
                if (!ctx.xhr.options.jsonData.hasOwnProperty(i)) {
                    continue;
                }

                body[i] = ctx.xhr.options.jsonData[i];
            }


            if (!body.textPlain && body.textHtml) {
                body.textPlain = Ext.util.Format.stripTags(body.textHtml);
            } else if (!body.textHtml) {
                body.textHtml = body.textPlain;
            }

            let draft = MessageTable.createMessageDraft(body.mailAccountId, body.mailFolderId, {});
            newRec = MessageTable.updateMessageBody(body.mailAccountId, body.mailFolderId, draft.id, {
                textPlain :  body.textPlain,
                textHtml : body.textHtml
            });

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            let retVal = {success : true, data: {
                    id        : newRec.id,
                    mailFolderId  : newRec.mailFolderId,
                    mailAccountId : newRec.mailAccountId,
                    textPlain : newRec.textPlain,
                    textHtml  : newRec.textHtml
                }
            };

            ret.responseText = Ext.JSON.encode(retVal);

            console.log("POSTED MessageBodyDraft", retVal);
            return ret;
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
                mailFolderId,mailAccountId;

            if (id == 'MessageItems') {
                id = undefined;
                pt.push('foo');
            }

            mailFolderId = pt.pop();
            mailFolderId = pt.pop();
            mailAccountId = pt.pop();
            mailAccountId = pt.pop();

            return {
                mailAccountId : decodeURIComponent(mailAccountId),
                mailFolderId : decodeURIComponent(mailFolderId),
                id : id ? decodeURIComponent(id) : undefined
            };
        }

    });



});