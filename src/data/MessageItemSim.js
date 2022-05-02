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
 * JsonSimlet for MessageItem-data.
 */
Ext.define("conjoon.dev.cn_mailsim.data.MessageItemSim", {

    extend: "Ext.ux.ajax.JsonSimlet",

    requires: [
        "conjoon.dev.cn_mailsim.data.table.MessageTable"
    ],

    doDelete: function (ctx) {

        const me  = this,
            keys = me.extractCompoundKey(ctx.url),
            MessageTable = conjoon.dev.cn_mailsim.data.table.MessageTable;


        /* eslint-disable-next-line no-console*/
        console.log("DELETE MessageItem - ",keys);

        let ret = {}, found = false,
            id = keys.id,
            mailAccountId = keys.mailAccountId,
            mailFolderId = keys.mailFolderId;

        if (!id) {
            /* eslint-disable-next-line no-console*/
            console.log("DELETE MessageItem - no numeric id specified.");
            return {status: 400, success: false};
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
            return {status: 404, success: false};
        }

        Ext.Array.forEach(me.responseProps, function (prop) {
            if (prop in me) {
                ret[prop] = me[prop];
            }
        });

        ret.responseText = Ext.JSON.encode({success: true});


        Ext.apply(me, ret);
        return ret;
    },


    doPost: function (ctx) {

        let target = ctx.params.target;

        if (target === "MessageItem") {
            /* eslint-disable-next-line no-console*/
            console.error("POSTing MessageItem - this should only happen in tests");
            return;
        }

        if (ctx.params.target === "MessageBodyDraft") {
            return this.postMessageBody(ctx);
        }

        if (ctx.params.target !== "MessageDraft") {
            Ext.raise("Invalid target parameter: " + ctx.params.target);
        }

        // MessageDraft
        /* eslint-disable-next-line no-console*/
        console.log("POST MessageDraft", ctx, ctx.xhr.options.jsonData);

        var me            = this,
            draft         = {},
            ret           = {},
            MessageTable  = conjoon.dev.cn_mailsim.data.table.MessageTable;

        for (var i in ctx.xhr.options.jsonData) {
            if (!Object.prototype.hasOwnProperty.call(ctx.xhr.options.jsonData, i)) {
                continue;
            }

            if (i === "to" || i === "cc" || i === "bcc") {
                draft[i] = Ext.JSON.decode(ctx.xhr.options.jsonData[i]);
            } else {
                draft[i] = ctx.xhr.options.jsonData[i];
            }
        }

        if (draft.subject === "TESTFAIL") {
            ret.status = 500;
            ret.responseText = Ext.JSON.encode({
                success: false
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
            data: {
                id: draft.id,
                mailFolderId: draft.mailFolderId,
                mailAccountId: draft.mailAccountId
            }});

        return ret;

    },


    doPatch: function (ctx) {

        var me           = this,
            keys         = me.extractCompoundKey(ctx.url),
            ret          = {},
            MessageTable = conjoon.dev.cn_mailsim.data.table.MessageTable,
            values       = {},
            result,
            target = ctx.params.target;

        if (!target) {
            if (ctx.url.indexOf("/MessageBody") !== -1) {
                target = "MessageBodyDraft";
            } else if (ctx.url.indexOf("/MessageItem") !== -1) {
                target = "MessageItem";
            } else if (ctx.url.indexOf("/MessageDraft") !== -1) {
                target = "MessageDraft";
            }

        }

        if (["MessageBodyDraft", "MessageItem"].indexOf(target) !== -1) {
            values = Object.assign(
                {},
                ctx.xhr.options.jsonData.data.attributes,
                ctx.xhr.options.jsonData.data
            );
            delete values.attributes;


            /* eslint-disable-next-line no-console*/
            console.log("PUT " + target, values);


            if (target === "MessageBodyDraft") {
                result = MessageTable.updateMessageBody(keys.mailAccountId, keys.mailFolderId, keys.id, values);
            } else {
                result = MessageTable.updateMessageItem(keys.mailAccountId, keys.mailFolderId, keys.id, values);
            }

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            result.recent = false;

            let retVal = {
                success: true,
                data: result
            };
            ret.responseText = Ext.JSON.encode(retVal);

            /* eslint-disable-next-line no-console*/
            console.log("PUT " + target + ",", ctx.url, ", response: ", ret);

            return ret;
        }


        // This is where we trigger an idchange
        /* eslint-disable-next-line no-console*/
        console.log("PUT MessageDraft", ctx.xhr.options.jsonData);

        // MESSAGE DRAFT

        ret           = {};
        MessageTable  = conjoon.dev.cn_mailsim.data.table.MessageTable;
        values        = {};
        keys          = me.extractCompoundKey(ctx.url);

        values = Object.assign(
            {},
            ctx.xhr.options.jsonData.data.attributes,
            ctx.xhr.options.jsonData.data
        );
        delete values.attributes;

        if (values.subject === "TESTFAIL") {
            ret.status = 500;
            ret.responseText = Ext.JSON.encode({
                success: false
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

        for (let i in values) {
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
            data: values
        });

        /* eslint-disable-next-line no-console*/
        console.log("PUT MessageDraft, response: ", values);

        return ret;


    },


    data: function (ctx) {

        let me = this,
            keys = me.extractCompoundKey(ctx.url),
            id,
            MessageTable = conjoon.dev.cn_mailsim.data.table.MessageTable,
            messageItems = MessageTable.getMessageItems(),
            ret = {},
            mailAccountId,
            mailFolderId,
            fields = ctx.params.attributes ? ctx.params.attributes.split(",") : [],
            messageItemIds = [];

        if (ctx.params.messageItemIds) {
            throw new Error("unexpected param messageItemIds");
        }

        let idFilter = null;
        if (ctx.params.filter) {
            idFilter = JSON.parse(ctx.params.filter);
            if (idFilter) {
                idFilter.some(filter => {
                    if (filter.property === "id") {
                        idFilter = idFilter[0].property === "id" ? idFilter[0].value : [];
                        messageItemIds = idFilter;
                        return true;
                    }
                });
            }
        }

        let excludeFields = [], includeFields = [];

        //  * found, map excludeFields
        if (fields.indexOf("*") !== -1) {
            excludeFields = fields.filter(field => field !== "*");
        } else if (fields.length) {
            includeFields = ["mailAccountId", "mailFolderId", "id"].concat(fields);
        }


        if (ctx.url.indexOf("/MessageBody") !== -1) {

            /* eslint-disable-next-line no-console*/
            console.log("GET MessageBody/MessageBodyDraft ", ctx.url, keys);
            return this.getMessageBody(keys.mailAccountId, keys.mailFolderId, keys.id, true);
        }

        if (ctx.params.attributes === "*,previewText,hasAttachments,size") {

            /* eslint-disable-next-line no-console*/
            console.log("GET MessageDraft ", ctx.url);

            let keys = me.extractCompoundKey(ctx.url);

            mailAccountId = keys.mailAccountId;
            mailFolderId  = keys.mailFolderId;
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
                    success: false
                };

                //ret.status = "404";
                //ret.statusText = "Not Found";
                //return ret;
            } else {
                retVal = {
                    success: true,
                    data: fitem
                };
            }

            /* eslint-disable-next-line no-console*/
            console.log("GET MessageDraft, response ", retVal);

            return retVal;
        }


        if (keys.id) {
            id = keys.id;

            let item;
            for (let i in messageItems) {
                let messageItem = messageItems[i];
                if (messageItem.mailAccountId === keys.mailAccountId &&
                    messageItem.mailFolderId === keys.mailFolderId &&
                    messageItem.id === "" + id) {
                    item = messageItem;
                    break;
                }
            }

            if (!item) {
                return {status: 404, success: false};
            }

            /* eslint-disable-next-line no-console*/
            console.log("GET MessageItem ", item);
            return {data: item};

        } else if (!id) {
            /* eslint-disable-next-line no-console*/
            console.log("GET MessageItems ", ctx, keys);
            var items = [];
            for (let i in messageItems) {
                let messageItem = messageItems[i];
                if (messageItem.mailAccountId === keys.mailAccountId &&
                    messageItem.mailFolderId === keys.mailFolderId) {

                    if (messageItemIds.length) {
                        if (!messageItemIds.includes(messageItem.id)) {
                            continue;
                        }
                    }

                    if (excludeFields.length) {
                        excludeFields.forEach(field => {
                            delete messageItem[field];
                        });
                    } else if (includeFields.length) {
                        let tmpItem = {};
                        includeFields.forEach(field => {
                            tmpItem[field] = messageItem[field];
                        });
                        messageItem = tmpItem;
                    }


                    items.push(messageItem);
                }
            }


            /* eslint-disable-next-line no-console*/
            console.log("GET MessageItems response", items);
            if (!ctx.xhr.options.proxy) {
                // create a proxy mock so that rootProperty is applied to data
                ctx.xhr.options.proxy = {
                    getReader: () => ({
                        getTotalProperty: () => "count",
                        rootProperty: "data",
                        getRootProperty: () => "data"
                    })
                };
            }

            return items;
        } else {
            return messageItems;
        }
    },


    /**
     * Adds recent items to the list of MessageItems in the MessageTable, if a filter
     * is detected.
     *
     * @param ctx
     * @returns {*}
     */
    doGet (ctx) {

        const
            me = this,
            MessageTable = conjoon.dev.cn_mailsim.data.table.MessageTable;

        if (ctx.params.target === "MessageItem" && ctx.params.filter) {
            MessageTable.addRecentItems(
                MessageTable.buildRandomNumber(0, 2),
                me.extractCompoundKey(ctx.url).mailFolderId
            );

        }

        return me.callParent(arguments);
    },


    getMessageBody: function (mailAccountId, mailFolderId, id) {

        let retVal;

        if (conjoon.dev.cn_mailsim.data.table.MessageTable.peekMessageBody(
            mailAccountId,
            mailFolderId,
            id
        )) {

            retVal = {success: true, data: conjoon.dev.cn_mailsim.data.table.MessageTable
                .getMessageBody(
                    mailAccountId,
                    mailFolderId,
                    id
                )};

            let entity = "MessageBodyDraft/MessageBody";

            /* eslint-disable-next-line no-console*/
            console.log("GET " + entity + ", response, ", retVal);

            return retVal;
        }

        retVal = {success: false};

        /* eslint-disable-next-line no-console*/
        console.log("GET MessageBody, response, ", retVal);
        return retVal;

    },


    postMessageBody: function (ctx) {

        /* eslint-disable-next-line no-console*/
        console.log("POST MessageBodyDraft", ctx.xhr.options.jsonData);

        const MessageTable = conjoon.dev.cn_mailsim.data.table.MessageTable;

        var me    = this,
            body  = {},
            ret   = {},
            newRec;

        body = Object.assign(
            {},
            ctx.xhr.options.jsonData.data.attributes,
            ctx.xhr.options.jsonData.data
        );
        delete body.attributes;

        if (!body.textPlain && body.textHtml) {
            body.textPlain = Ext.util.Format.stripTags(body.textHtml);
        } else if (!body.textHtml) {
            body.textHtml = body.textPlain;
        }

        let draft = MessageTable.createMessageDraft(body.mailAccountId, body.mailFolderId, {});
        newRec = MessageTable.updateMessageBody(body.mailAccountId, body.mailFolderId, draft.id, {
            textPlain: body.textPlain,
            textHtml: body.textHtml
        });

        Ext.Array.forEach(me.responseProps, function (prop) {
            if (prop in me) {
                ret[prop] = me[prop];
            }
        });

        let retVal = {success: true, data: {
            id: newRec.id,
            mailFolderId: newRec.mailFolderId,
            mailAccountId: newRec.mailAccountId,
            textPlain: newRec.textPlain,
            textHtml: newRec.textHtml
        }};

        ret.responseText = Ext.JSON.encode(retVal);

        /* eslint-disable-next-line no-console */
        console.log("POSTED MessageBodyDraft", ctx.url, retVal);
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
            id = pt.pop().split("?")[0],
            mailFolderId,mailAccountId;

        if (id === "MessageItems") {
            id = undefined;
            pt.push("foo");
        }

        if (["MessageBody", "MessageDraft", "MessageItem"].includes(id)) {
            id = pt.pop();
        }

        pt.pop();
        mailFolderId = pt.pop();
        pt.pop();
        mailAccountId = pt.pop();

        return {
            mailAccountId: decodeURIComponent(mailAccountId),
            mailFolderId: decodeURIComponent(mailFolderId),
            id: id ? decodeURIComponent(id) : undefined
        };
    }


});
