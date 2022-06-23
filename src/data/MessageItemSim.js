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

        let ret = me.prepareResponseHeader(), found = false,
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

        ret.responseText = Ext.JSON.encode({success: "A"});

        return ret;
    },


    doPost: function (ctx) {

        const
            me = this,
            jsonData = ctx.xhr.options.jsonData;

        let target;
        if (jsonData) {
            target = jsonData.data.type;
        }

        if (!target) {
            /**
             * avoid /MessageItems - append query separator "?"
             */
            if (ctx.url.indexOf("/MessageItems/") !== -1) {
                return this.sendMessage(ctx);
            }

            throw new Error("expected target with request");
        }


        if (target === "MessageBody") {
            if (Object.keys(jsonData.data.attributes).includes("textHtml") ||
                Object.keys(jsonData.data.attributes).includes("textPlain")) {
                return this.postMessageBody(ctx);
            }
        }

        me.beginLog("POST", target, ctx, jsonData);

        const
            ret          = me.prepareResponseHeader(),
            MessageTable = conjoon.dev.cn_mailsim.data.table.MessageTable;

        let draft = me.extractValues(ctx.xhr.options.jsonData);

        for (var i in draft) {
            if (i === "to" || i === "cc" || i === "bcc" || i === "replyTo") {
                draft[i] = Ext.JSON.decode(draft[i]);
            }
        }

        if (draft.subject === "TESTFAIL") {
            ret.status = 400;
            ret.statusText = "Bad Request";
            me.endLog("POST", target, ret);
            return ret;
        }

        draft = MessageTable.createMessageDraft(draft.mailAccountId, draft.mailFolderId, draft);

        ret.responseText = Ext.JSON.encode({
            included: [
                me.getIncludedOrDummy(draft.mailAccountId, draft.mailFolderId)
            ],
            data: me.toJsonApi({
                id: draft.id,
                mailFolderId: draft.mailFolderId,
                mailAccountId: draft.mailAccountId
            }, "MessageDraft")});

        /* eslint-disable-next-line no-console*/
        me.endLog("POST", target, ret);
        return ret;

    },


    doPatch: function (ctx) {

        var me           = this,
            keys         = me.extractCompoundKey(ctx.url),
            ret          = me.prepareResponseHeader(),
            MessageTable = conjoon.dev.cn_mailsim.data.table.MessageTable,
            values       = {},
            result,
            target = ctx.params.target;

        if (!target) {
            /**
             * avoid /MessageItems - append query separator "?"
             */
            if (ctx.url.indexOf("/MessageBody?") !== -1) {
                target = "MessageBodyDraft";
            } else if (ctx.url.indexOf("/MessageDraft?") !== -1) {
                target = "MessageDraft";
            } else if (ctx.url.indexOf("/MessageItem?") !== -1) {
                target = "MessageItem";
            }

        }

        if (["MessageBodyDraft", "MessageItem"].indexOf(target) !== -1) {
            values = me.extractValues(ctx.xhr.options.jsonData);


            /* eslint-disable-next-line no-console*/
            console.log("PATCH " + target, values);


            if (target === "MessageBodyDraft") {
                result = MessageTable.updateMessageBody(keys.mailAccountId, keys.mailFolderId, keys.id, values);
            } else {
                result = MessageTable.updateMessageItem(keys.mailAccountId, keys.mailFolderId, keys.id, values);
                result = Object.fromEntries(Object.entries(result).filter((entry) => !!values[entry[0]]));
            }

            result.recent = false;

            let retVal = {
                included: [
                    me.getIncludedOrDummy(result.mailAccountId, result.mailFolderId)
                ],
                data: me.toJsonApi(result, target)
            };
            ret.responseText = Ext.JSON.encode(retVal);

            /* eslint-disable-next-line no-console*/
            console.log("PATCH " + target + ",", ctx.url, ", response: ", ret);

            return ret;
        }


        // This is where we trigger an idchange
        /* eslint-disable-next-line no-console*/
        console.log("PATCH MessageDraft", ctx.xhr.options.jsonData);

        // MESSAGE DRAFT

        ret           = me.prepareResponseHeader();
        MessageTable  = conjoon.dev.cn_mailsim.data.table.MessageTable;
        values        = {};
        keys          = me.extractCompoundKey(ctx.url);

        values = me.extractValues(ctx.xhr.options.jsonData);

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

        ret.responseText = Ext.JSON.encode({
            included: [
                me.getIncludedOrDummy(values.mailAccountId, values.mailFolderId)
            ],
            data: me.toJsonApi(values, "MessageDraft")
        });


        /* eslint-disable-next-line no-console*/
        console.log("PATCH MessageDraft, response: ", values);

        return ret;


    },


    data: function (ctx) {

        let me = this,
            keys = me.extractCompoundKey(ctx.url),
            id,
            MessageTable = conjoon.dev.cn_mailsim.data.table.MessageTable,
            messageItems = MessageTable.getMessageItems(),
            mailAccountId,
            mailFolderId,
            fields = ctx.params["fields[MessageItem]"] ? ctx.params["fields[MessageItem]"].split(",") : [],
            messageItemIds = [];

        if (ctx.params.messageItemIds) {
            throw new Error("unexpected param messageItemIds");
        }

        mailAccountId = keys.mailAccountId;
        mailFolderId  = keys.mailFolderId;


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

            let mb = me.getMessageBody(keys.mailAccountId, keys.mailFolderId, keys.id, true);
            if (mb.status && mb.status >= 400) {
                return mb;
            }

            /* eslint-disable-next-line no-console*/
            console.log("GET MessageBody/MessageBodyDraft ", ctx.url, keys);
            return {
                included: [
                    me.getIncludedOrDummy(mailAccountId, mailFolderId)
                ],
                data: mb
            };

        }

        if (ctx.params["fields[MessageItem]"] === "*,previewText,hasAttachments,size") {

            /* eslint-disable-next-line no-console*/
            console.log("GET MessageDraft ", ctx.url);

            id = keys.id;

            let fitem = MessageTable.getMessageDraft(mailAccountId, mailFolderId, id);

            let retVal = null;
            if (!fitem) {

                retVal = {
                    status: 404,
                    statusText: "Not Found HEre"
                };
                //ret.statusText = "Not Found";
                //return ret;
            } else {
                retVal = {
                    included: [
                        me.getIncludedOrDummy(mailAccountId, mailFolderId)
                    ],
                    data: me.toJsonApi(fitem, "MessageDraft")
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


            /* eslint-disable-next-line no-console*/
            console.log("GET MessageItem ", item);

            if (!item) {
                return {status: 404, statusText: "Not Found"};
            }

            return {
                included: [
                    me.getIncludedOrDummy(mailAccountId, mailFolderId)
                ],
                data: me.toJsonApi(item, "MessageItem")
            };

        } else if (!id) {

            if (!ctx.params["fields[MessageItem]"] ||
                ctx.params["fields[MailFolder]"] !== "unreadMessages,totalMessages" ||
                ctx.params["include"] !== "MailFolder") {
                throw new Error("sim expects GET MessageItems to include MailFolders relationship");
            }

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

            let mailFolder = me.getIncludedOrDummy(mailAccountId, mailFolderId);
            mailFolder.attributes.totalMessages = items.length;

            items = this.sortAndFilter(ctx, items);

            items = items.map(item => me.toJsonApi(item, "MessageItem"));

            items = {
                data: this.getPage(ctx, items),
                included: [
                    mailFolder
                ]
            };


            /* eslint-disable-next-line no-console*/
            console.log("GET MessageItems response", items);
            if (!ctx.xhr.options.proxy) {
                // create a proxy mock so that rootProperty is applied to data
                ctx.xhr.options.proxy = {
                    getReader: () => {
                        return {
                            getTotalProperty: () => items.length,
                            rootProperty: "data",
                            getRootProperty: () => "data"
                        };
                    }
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

        if (ctx.url.indexOf("/MessageItems?") !== -1 && ctx.params.filter) {
            MessageTable.addRecentItems(
                MessageTable.buildRandomNumber(0, 2),
                me.extractCompoundKey(ctx.url).mailFolderId
            );

        }

        // GET MessageItems
        //  if (ctx.url.indexOf("/MessageItems?") !== -1 && ctx.params.include === "MailFolder") {
        let retVal = me.data(ctx), ret = me.prepareResponseHeader();

        if (retVal.status && retVal.status >= 400) {
            return retVal;
        }

        ret.responseText = Ext.JSON.encode(retVal);

        return ret;
    },


    getMessageBody: function (mailAccountId, mailFolderId, id) {

        const
            me = this;

        let retVal;

        if (conjoon.dev.cn_mailsim.data.table.MessageTable.peekMessageBody(
            mailAccountId,
            mailFolderId,
            id
        )) {

            retVal = me.toJsonApi(
                conjoon.dev.cn_mailsim.data.table.MessageTable
                    .getMessageBody(
                        mailAccountId,
                        mailFolderId,
                        id
                    ),
                "MessageBody"
            );

            let entity = "MessageBodyDraft/MessageBody";

            /* eslint-disable-next-line no-console*/
            console.log("GET " + entity + ", response, ", retVal);

            return retVal;
        }

        retVal = {status: 404};

        /* eslint-disable-next-line no-console*/
        console.log("GET MessageBody, response, ", retVal);
        return retVal;

    },


    postMessageBody: function (ctx) {

        const
            me = this,
            MessageTable = conjoon.dev.cn_mailsim.data.table.MessageTable;

        me.beginLog("POST", "MessageBody", ctx, ctx.xhr.options.jsonData);

        var body  = {},
            ret   = me.prepareResponseHeader(),
            newRec;

        body = me.extractValues(ctx.xhr.options.jsonData);

        delete body.attributes;

        if (!body.textPlain && body.textHtml) {
            body.textPlain = Ext.util.Format.stripTags(body.textHtml);
        } else if (!body.textHtml) {
            body.textHtml = body.textPlain;
        }

        let draft;

        // POSTed with meta data, references existing data
        if (body.id) {
            newRec = MessageTable.updateMessageBody(body.mailAccountId, body.mailFolderId, body.id, {
                textPlain: body.textPlain,
                textHtml: body.textHtml
            });
        } else {
            draft = MessageTable.createMessageDraft(body.mailAccountId, body.mailFolderId, {});
            newRec = MessageTable.updateMessageBody(body.mailAccountId, body.mailFolderId, draft.id, {
                textPlain: body.textPlain,
                textHtml: body.textHtml
            });
        }


        let retVal = {
            included: [
                me.getIncludedOrDummy(newRec.mailAccountId, newRec.mailFolderId)
            ],
            data: me.toJsonApi({
                id: newRec.id,
                mailFolderId: newRec.mailFolderId,
                mailAccountId: newRec.mailAccountId,
                textPlain: newRec.textPlain,
                textHtml: newRec.textHtml
            }, "MessageBody")
        };

        ret.responseText = Ext.JSON.encode(retVal);

        me.endLog("POST", "MessageBody", ret);

        return ret;
    },


    /**
     * extract key/value pairs from submitted jsonData in data.attributes
     */
    extractValues (jsonData) {

        const values = Object.assign(
            {},
            jsonData.data,
            jsonData.data.attributes
        );

        delete values.type;
        delete values.attributes;

        return values;
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
    },


    /**
     * Sends a Message.
     * @param ctx
     * @returns {{}}
     */
    sendMessage: function (ctx) {

        const
            me           = this,
            ret          = me.prepareResponseHeader(),
            MessageTable = conjoon.dev.cn_mailsim.data.table.MessageTable,
            key             = me.extractCompoundKey(ctx.url),
            id              = key.id,
            mailAccountId   = key.mailAccountId,
            mailFolderId    = key.mailFolderId,
            draft           = MessageTable.getMessageDraft(mailAccountId, mailFolderId, id);

        me.beginLog("POST", "Send Message", ctx);

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
            ret.status = 500;
            ret.statusText = "Internal Server Error";
            return ret;
        }

        ret.responseText = Ext.JSON.encode({
        });

        me.endLog("POST", "Send Message", ret);
        return ret;
    },

    toJsonApi (item, type) {

        switch (type) {
        case "MessageBody":
        case "MessageBodyDraft":
        case "MessageDraft":
        case "MessageItem":
            item = Object.assign({
                type: type,
                id: item.id,
                relationships: {
                    MailFolder: {
                        data: {
                            id: item.mailFolderId,
                            type: "MailFolder"
                        }
                    }
                }
            }, {
                attributes: Object.fromEntries(Object.entries(item).filter(entry => {
                    return !["mailFolderId", "mailAccountId", "id"].includes(entry[0]);
                }))
            });
            break;
        }


        return item;
    },

    getIncludedOrDummy (mailAccountId, mailFolderId) {

        const MailFolderTable = conjoon.dev.cn_mailsim.data.table.MailFolderTable;
        return MailFolderTable.get(mailAccountId, mailFolderId) || MailFolderTable.createDummy(mailAccountId, mailFolderId);

    },

    prepareResponseHeader () {

        return {status: 200, statusText: "OK"};
    },

    sortAndFilter (ctx, items) {

        function makeSortFn (def, cmp) {

            var order = def.direction,
                sign = (order && order.toUpperCase() === "DESC") ? -1 : 1;
            return function (leftRec, rightRec) {
                var lhs = leftRec[def.property],
                    rhs = rightRec[def.property],
                    c = (lhs < rhs) ? -1 : ((rhs < lhs) ? 1 : 0);
                if (c || !cmp) {
                    return c * sign;
                }
                return cmp(leftRec, rightRec);
            };
        }
        function makeSortFns (defs, cmp) {
            var sortFn, i;
            for (sortFn = cmp , i = defs && defs.length; i; ) {
                sortFn = makeSortFn(defs[--i], sortFn);
            }
            return sortFn;
        }

        let fields = ctx.params.sort;
        if (ctx.params.dir) {
            fields = [
                {
                    direction: ctx.params.dir,
                    property: fields
                }
            ];
        } else {
            fields = ctx.params.sort && Ext.decode(ctx.params.sort);
        }
        let sortFn = makeSortFns(fields);
        if (sortFn) {
            items = Ext.Array.sort(items, sortFn);
        }

        if (ctx.params.filter && Ext.decode(ctx.params.filter)) {
            let filters = new Ext.util.FilterCollection();
            filters.add(this.processFilters(Ext.decode(ctx.params.filter)));
            items = Ext.Array.filter(items, filters.getFilterFn());
        }

        return items;
    },


    beginLog (method, target) {
        /* eslint-disable-next-line no-console*/
        console.log("\n-------------\n----BEGIN----\n" + `${method} ${target}`, ... Array.prototype.slice.apply(arguments, [2]));

    },

    endLog (method, target) {
        /* eslint-disable-next-line no-console*/
        console.log(`${method} ${target}`, ... Array.prototype.slice.apply(arguments, [2]));
        /* eslint-disable-next-line no-console*/
        console.log("-------------\n-----END-----");
    }


});
