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
            jsonData = ctx.xhr.options.jsonData,
            keys = me.extractCompoundKey(ctx.url);

        let target;
        if (jsonData) {
            target = jsonData.data.type;
        }

        if (!target) {
            /**
             * avoid /MessageItems - append query separator "?"
             */
            if (ctx.url.indexOf("/send") !== -1) {
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
            ret          = me.prepareResponseHeader(ctx, me.getExpectedQuery("post.messageitem")),
            MessageTable = conjoon.dev.cn_mailsim.data.table.MessageTable;


        if (ret.status !== 200) {
            return ret;
        }
        let draft = me.extractValues(ctx.xhr.options.jsonData);

        ["from", "to", "cc", "bcc", "replyTo"].forEach(key => {
            draft[key] && (draft[key] = Ext.JSON.decode(draft[key]));
        });

        if (draft.subject === "TESTFAIL") {
            ret.status = 400;
            ret.statusText = "Bad Request";
            me.endLog("POST", target, ret);
            return ret;
        }
        draft = MessageTable.createMessageDraft(keys.mailAccountId, keys.mailFolderId, draft);
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

        const
            me           = this,
            keys         = me.extractCompoundKey(ctx.url),
            ret          = me.prepareResponseHeader(),
            MessageTable = conjoon.dev.cn_mailsim.data.table.MessageTable,
            values       = me.extractValues(ctx.xhr.options.jsonData),
            target       = ctx.xhr.options.jsonData.data.type;

        let result;

        if (!target) {
            throw new Error("\type\" must be available in request body");
        }


        if (Object.keys(values).filter(val => !["flagged", "id", "seen"].includes(val)).length === 0 ||
            target === "MessageBody") {

            me.beginLog("PATCH", target, ctx, values);

            if (target === "MessageBody") {
                result = MessageTable.updateMessageBody(keys.mailAccountId, keys.mailFolderId, keys.id, values);
            } else {
                result = MessageTable.updateMessageItem(keys.mailAccountId, keys.mailFolderId, keys.id, values);
                result = Object.fromEntries(Object.entries(result).filter((entry) => !!values[entry[0]]));
            }

            result.recent = false;

            let retVal = {
                included: [
                    me.getIncludedOrDummy(keys.mailAccountId, keys.mailFolderId)
                ],
                data: me.toJsonApi(result, target)
            };
            ret.responseText = Ext.JSON.encode(retVal);

            me.endLog("PATCH", target, ret);

            return ret;
        }

        me.beginLog("PATCH (idChange)", target, ctx, values);

        if (values.subject === "TESTFAIL") {
            ret.status = 500;
            ret.responseText = Ext.JSON.encode({
                success: false
            });
            me.endLog("PATCH (idChange)", target, ret);

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
                me.getIncludedOrDummy(draft.mailAccountId, draft.mailFolderId)
            ],
            data: me.toJsonApi(values, "MessageDraft")
        });

        me.endLog("PATCH (idChange)", target, ret);

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
            fieldsMailFolder = ctx.params["fields[MailFolder]"] !== undefined ? ctx.params["fields[MailFolder]"].split(",") : undefined,
            fieldsMessageBody = ctx.params["fields[MessageBody]"] !== undefined  ? ctx.params["fields[MessageBody]"].split(",") : undefined,
            fieldsMessageItem = ctx.params["fields[MessageItem]"] !== undefined ? ctx.params["fields[MessageItem]"].split(",") : undefined,
            relfieldsMessageItem = ctx.params["relfield:fields[MessageItem]"] !== undefined ? ctx.params["relfield:fields[MessageItem]"].split(",") : undefined,

            messageItemIds = [],
            relInclude =  ctx.params["include"] ? ctx.params["include"].split(",") : undefined;

        // translate the parameters here since the Simlet works internally with default values,
        // as it relies on "start" and "limit" to be available with params.start and params.limit
        if (ctx.xhr.options.proxy) {
            ctx.params.start = ctx.params[ctx.xhr.options.proxy.getStartParam()];
            ctx.params.limit = ctx.params[ctx.xhr.options.proxy.getLimitParam()];
        }

        fieldsMailFolder = fieldsMailFolder && fieldsMailFolder[0] === "" ? [] : fieldsMailFolder;
        fieldsMessageBody = fieldsMessageBody && fieldsMessageBody[0] === "" ? [] : fieldsMessageBody;
        fieldsMessageItem = fieldsMessageItem && fieldsMessageItem[0] === "" ? [] : fieldsMessageItem;

        if (ctx.params.messageItemIds) {
            throw new Error("unexpected param messageItemIds");
        }

        if (relfieldsMessageItem && fieldsMessageItem) {
            throw new Error("relfield extension not allowed to be used with same resource object");
        }

        mailAccountId = keys.mailAccountId;
        mailFolderId  = keys.mailFolderId;


        let idFilter = null;
        if (ctx.params.filter) {
            idFilter = this.toExtJsFilter(JSON.parse(ctx.params.filter));
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

        // sparse fieldsets / relfield extension support
        let defaultMessageItemFields = Object.keys(Object.entries(messageItems)[0][1]).filter(field => !["cc", "bcc", "replyTo"].includes(field));

        if (relfieldsMessageItem) {
            let allPrefixed = relfieldsMessageItem.every(field => field.indexOf("+") === 0 || field.indexOf("-") === 0);
            let allNotPrefixed = relfieldsMessageItem.every(field => field.indexOf("+") === -1 && field.indexOf("-") === -1);
            if (allPrefixed !== true && allNotPrefixed !== true) {
                throw new Error("relfield extension requires prefixes for all fields, or no prefixes at all");
            }
            if (allNotPrefixed) {
                // no prefixed: assign relfields to regular sparse fieldsets, let processing continue
                fieldsMessageItem = relfieldsMessageItem;
            } else {
                fieldsMessageItem = defaultMessageItemFields;
                relfieldsMessageItem.forEach(field => {
                    if (field.indexOf("+") === 0) {
                        let f = field.substring(1);
                        if (!fieldsMessageItem.includes(f)) {
                            fieldsMessageItem.push(f);
                        }
                    }
                    if (field.indexOf("-") === 0) {
                        let f = field.substring(1);
                        fieldsMessageItem = fieldsMessageItem.filter(field => field !== f);
                    }
                });
            }
        }

        if (fieldsMessageItem) {
            // fields[MessageItem]=&... -> exclude all
            // fields[MessageItem]=subject -> exclude all except subject
            excludeFields = defaultMessageItemFields.filter(
                field => !fieldsMessageItem.concat(["mailAccountId", "mailFolderId", "id"]).includes(field)
            );
        } else if (!fieldsMessageItem) {
            includeFields = defaultMessageItemFields;
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

        if (ctx.params["relfield:fields[MessageItem]"] === "+cc,+bcc,+replyTo,-hasAttachments,-size") {

            /* eslint-disable-next-line no-console*/
            console.log("GET MessageDraft ", ctx.url);

            id = keys.id;

            let fitem = MessageTable.getMessageDraft(mailAccountId, mailFolderId, id);

            if (fitem) {
                fitem = Object.fromEntries(
                    Object.entries(fitem).filter(
                        data => !fieldsMessageItem.includes(data[1])
                    ));
            }

            let retVal = null;
            if (!fitem) {

                retVal = {
                    status: 404,
                    statusText: "Not Found Here"
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
            // get data for either /MessageBodies or /MessageItems
            if (ctx.params["fields[MailFolder]"] === undefined ||
                (!relInclude || !relInclude.includes("MailFolder"))) {
                throw new Error("sim expects GET MessageItems to include MailFolders relationship");
            }

            let resourceTarget = "MessageItem";
            if (ctx.url.indexOf("/MessageBodies") !== -1) {
                resourceTarget = "MessageBody";
            }


            /* eslint-disable-next-line no-console*/
            console.log(`GET ${resourceTarget} `, ctx, keys);
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

            items = this.sortAndFilter(ctx, items);
            items = items.map(item => me.toJsonApi(item, "MessageItem"));

            let resourcePage = this.getPage(ctx, items);

            let incs = [];

            if (relInclude.includes("MailFolder")) {
                let mailFolder = me.getIncludedOrDummy(mailAccountId, mailFolderId);
                mailFolder.attributes.totalMessages = items.length;

                if (fieldsMailFolder !== undefined && fieldsMailFolder.length === 0) {
                    delete mailFolder.attributes;
                } else {
                    mailFolder.attributes = Object.fromEntries(
                        Object.entries(mailFolder.attributes).filter(entry => {
                            return fieldsMailFolder.includes(entry[0]) === true;
                        })
                    );
                }
                incs.push(mailFolder);
            }

            if (resourceTarget === "MessageBody" || relInclude.includes("MessageBody")) {
                let messageBodies = [];
                resourcePage.forEach(item => {
                    let messageBody = me.toJsonApi(me.getIncludedOrDummy({
                        entity: "MessageBody",
                        mailAccountId: mailAccountId,
                        mailFolderId: mailFolderId,
                        id: item.id,
                        params: ctx.params
                    }), "MessageBody");

                    if (fieldsMessageBody !== undefined && fieldsMailFolder.fieldsMessageBody === 0) {
                        delete messageBody.attributes;
                    }

                    messageBodies.push(messageBody);
                });

                if (resourceTarget === "MessageBody") {
                    resourcePage = messageBodies;
                } else {
                    incs = incs.concat(messageBodies);
                }


            }

            items = {
                data: resourcePage,
                included: incs
            };


            /* eslint-disable-next-line no-console*/
            console.log(`GET ${resourceTarget} response`, items);
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


    getMessageBody: function (mailAccountId, mailFolderId, id, autoCreate) {

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

        retVal = {status: 404, statusText: "Not found"};

        /* eslint-disable-next-line no-console*/
        console.log("GET MessageBody, response, ", retVal);
        return retVal;

    },


    postMessageBody: function (ctx) {

        const
            me = this,
            MessageTable = conjoon.dev.cn_mailsim.data.table.MessageTable,
            key = me.extractCompoundKey(ctx.url);

        me.beginLog("POST", "MessageBody", ctx, ctx.xhr.options.jsonData);

        var body  = {},
            ret   = me.prepareResponseHeader(ctx, me.getExpectedQuery("post.messagebody")),
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
            newRec = MessageTable.updateMessageBody(key.mailAccountId, key.mailFolderId, body.id, {
                textPlain: body.textPlain,
                textHtml: body.textHtml
            });
        } else {
            draft = MessageTable.createMessageDraft(key.mailAccountId, key.mailFolderId, {});
            newRec = MessageTable.updateMessageBody(key.mailAccountId, key.mailFolderId, draft.id, {
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

        delete values.mailFolderId;
        delete values.mailAccountId;

        if (values.relationships && values.relationships.MailFolder) {
            values.mailFolderId = values.relationships.MailFolder.data.id;
            delete values.relationships;
        }

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

        if (["MessageItems", "MessageBodies"].includes(id)) {
            id = undefined;
            pt.push("foo");
        }

        if (["MessageBodies", "MessageBody", "MessageDraft", "MessageItem", "send"].includes(id)) {
            id = pt.pop();
        }

        pt.pop();
        mailFolderId = pt.pop();
        pt.pop();
        mailAccountId = pt.pop();

        return Object.assign({
            mailAccountId: decodeURIComponent(mailAccountId),
            mailFolderId: decodeURIComponent(mailFolderId)
        }, id ? {id: decodeURIComponent(id)} : {});
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

        if (type === "MessageItem") {
            item.relationships.MessageBody = {
                data: {id: item.id, type: "MessageBody"}
            };
        }

        if (type === "MessageBody") {
            item.relationships.MessageItem = {
                data: {id: item.id, type: "MessageItem"}
            };
        }

        return item;
    },

    getIncludedOrDummy (mailAccountId, mailFolderId) {

        if (typeof mailAccountId === "object") {

            const
                cfg = mailAccountId,
                entity = cfg.entity,
                params = cfg.params || {},
                MessageTable = conjoon.dev.cn_mailsim.data.table.MessageTable;

            let body;

            switch (entity) {
            case "MessageBody":
                body = MessageTable.getMessageBody(
                    cfg.mailAccountId, cfg.mailFolderId, cfg.id
                );

                if (params["options[textPlain][length]"]) {
                    body.textPlain = body.textPlain.substr(0, params["options[textPlain][length]"]);
                }
                if (params["options[textPlain][textHtml]"]) {
                    body.textHtml = body.textPlain.substr(0, params["options[textHtml][length]"]);
                }
                return body;
            }

            throw new Error("missing entity");
        }

        const MailFolderTable = conjoon.dev.cn_mailsim.data.table.MailFolderTable;
        return MailFolderTable.get(mailAccountId, mailFolderId) || MailFolderTable.createDummy(mailAccountId, mailFolderId);


    },

    prepareResponseHeader (ctx, path) {

        let ret = {status: 200, statusText: "OK"};

        if (!ctx && !path) {
            return ret;
        }
        Object.entries(path).every((entry) => {

            let path = entry[0], value = entry[1];

            if (!l8.unchain(path, ctx) === value) {
                ret = {
                    status: 400,
                    statusText: "Bad Request",
                    responseText: JSON.stringify({
                        errors: [{code: 400, title: "Bad Request", detail: `${path} is missing in request`}]
                    })
                };
                return false;
            }
        });

        return ret;
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

        let fields = ctx.params.sort ? ctx.params.sort.split(",") : [];

        fields = fields.map( field => {
            return {property: field.split("-").pop(), direction: field.indexOf("-") === 0 ? "DESC" : "ASC"};
        });

        let sortFn = makeSortFns(fields);
        if (sortFn) {
            items = Ext.Array.sort(items, sortFn);
        }

        if (ctx.params.filter && Ext.decode(ctx.params.filter)) {
            let filters = new Ext.util.FilterCollection();

            const resFilters = this.toExtJsFilter(Ext.decode(ctx.params.filter));

            filters.add(this.processFilters(resFilters));
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
    },


    getExpectedQuery (type) {

        switch (type) {

        case "post.messagebody":
        case "post.messageitem":
            return {"params.include": "MailFolder", "params.fields[MailFolder]": ""};

        default:
            return {};

        }

    },

    /**
     * Filters now available in polish notation:
     * @example:
     * {
     *     "in": {
     *         "id": [1, 2, 3]
     *     }
     * }
     * @see php-lib-conjoon#8
     *
     * @return {Array}
     */
    toExtJsFilter (apiFiter) {

        const resFilters = [];

        Object.entries(apiFiter).forEach((filter) => {
            const key = filter[0], value = filter[1];
            if (["AND", "OR"].includes(key)) {
                throw new Error("no support for logical operators available");
            }

            resFilters.push({
                property: Object.entries(value)[0][0],
                value: Object.entries(value)[0][1],
                operator: key
            });
        });


        return resFilters;
    }


});
