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
 *
 */
Ext.define("conjoon.dev.cn_mailsim.data.table.MessageTable", {

    singleton: true,

    requires: [
        "conjoon.dev.cn_mailsim.data.table.AttachmentTable",
        "conjoon.dev.cn_mailsim.data.table.MessageFactory"
    ],


    ITEM_LENGTH: 1000,

    messageBodies: null,

    messageItems: null,

    baseMessageItems: null,

    DRAFT_KEY: 0,

    /**
     * Keeps track of recent messages, used as their id.
     * Increased with each new item generated.
     */
    recentId: 10000000,


    /**
     *
     */
    invokeMessageFactory () {
        const
            me = this,
            MessageFactory = conjoon.dev.cn_mailsim.data.table.MessageFactory;


        if (!me.messages) {
            me.messages = [
                MessageFactory.getMessage(1),
                MessageFactory.getMessage(2),
                MessageFactory.getMessage(3),
                MessageFactory.getMessage(4),
                MessageFactory.getMessage(5),
                MessageFactory.getMessage(6)
            ];
        }

        if (!me.rawMessages) {
            me.rawMessages = [
                MessageFactory.getRawMessage(1),
                MessageFactory.getRawMessage(2),
                MessageFactory.getRawMessage(3),
                MessageFactory.getRawMessage(4),
                MessageFactory.getRawMessage(5),
                MessageFactory.getRawMessage(6)
            ];
        }


    },


    /**
     *
     * @param min
     * @param max
     *
     * @return {Number}
     */
    buildRandomNumber: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    buildRandomSizeInBytes: function () {
        var me = this;

        return me.buildRandomNumber(1, 10000000);
    },

    buildPreviewText: function (mailAccountId, mailFolderId, id) {
        var me = this;

        let plain = me.getMessageBody(mailAccountId, mailFolderId, id).textPlain;
        return plain ? plain.substring(0, 200) : "";
    },

    buildRandomDate: function () {
        var me = this,
            dt  = new Date(),
            y  = me.buildRandomNumber(2007, dt.getFullYear()),
            m  = me.buildRandomNumber(1, y === dt.getFullYear() ? dt.getMonth() + 1 : 12),
            d  = me.buildRandomNumber(1, y === dt.getFullYear() && m - 1 === dt.getMonth() ? dt.getDate() : 31),
            h  = me.buildRandomNumber(
                0,
                y === dt.getFullYear() && m - 1 === dt.getMonth() && d === dt.getDate() ? dt.getHours() : 23
            ),
            i  = me.buildRandomNumber(
                0,
                y === dt.getFullYear() && m - 1 === dt.getMonth() && d === dt.getDate() ? dt.getMinutes() : 59
            ),
            pad = function (v) {
                return v < 10 ? "0" + v : v;
            };

        return Ext.String.format(
            "{0}-{1}-{2} {3}:{4}:00 +0000",
            y, pad(m), pad(d), pad(h), pad(i)
        );
    },


    buildAddresses: function (type, i) {
        // special for tests
        if (i + "" === 1 + "" && type !== "to") {
            return [];
        }

        return [{
            name: "John Doe",
            address: "john.doe@domain.tld"
        }, {
            name: "Mary Tyler Moore",
            address: "mr.ty.m@weezer.com"
        }];
    },

    remove: function (record) {
        const me = this;

        let items = me.messageItems;

        /* eslint-disable-next-line no-console*/
        console.log("REMOVING", record.getId());

        for (var i in items) {

            if (!Object.prototype.hasOwnProperty.call(items, i)) {
                continue;
            }

            if (items[i].id +"" === record.getId() + "") {
                delete items[i];

                /* eslint-disable-next-line no-console*/
                console.log("REMOVED");
                return;
            }

        }
    },

    createMessageBody: function (mailAccountId, mailFolderId, data) {

        if (arguments.length !== 3) {
            Ext.raise("Unexpected missing arguments");
        }

        var me  = this,
            inc = Ext.id(),
            newId = 0;

        // make sure alls message items are initialized along withh their
        // messagebodies
        me.getMessageItems();

        if (!me.messageBodies) {
            me.messageBodies = {};
        }

        for (var i in me.messageBodies) {
            var tmp = parseInt(me.messageBodies[i].id, 10);
            newId = Math.max(tmp, newId);
        }

        me.messageBodies[inc] = Ext.applyIf({
            id: ++newId,
            mailAccountId: mailAccountId,
            mailFolderId: mailFolderId
        }, data);

        return me.messageBodies[inc];
    },


    updateMessageBody: function (mailAccountId, mailFolderId, id, data, skipUpdate = false) {

        if (arguments.length < 4) {
            Ext.raise("Unexpected missing arguments");
        }

        const
            me = this,
            message = me.getMessageBody(mailAccountId, mailFolderId, id);

        // swap
        if (data.mailFolderId && mailFolderId !== data.mailFolderId) {
            let fkId;
            for (let i in me.messageBodies) {
                let mb = me.messageBodies[i];
                if (mb.mailAccountId === mailAccountId && mb.mailFolderId === mailFolderId && mb.id + "" === id + "") {
                    fkId = i;
                    break;
                }
            }
            if (!fkId) {
                Ext.raise("no MessageBody found!");
            }
            delete me.messageBodies[fkId];
            me.messageBodies[Ext.id()] = message;
        }


        // just in case
        delete data.id;

        if (!data.textPlain && data.textHtml) {
            data.textPlain = Ext.util.Format.stripTags(data.textHtml);
        }

        Ext.apply(message, data);

        // force to refresh the date
        if (skipUpdate !== true) {

            let item = me.updateAllItemData(mailAccountId, mailFolderId, id, {}, true);

            conjoon.dev.cn_mailsim.data.table.AttachmentTable.moveAttachments(
                mailAccountId, mailFolderId, id, {parentMessageItemId: item.id}
            );
        }

        return message;
    },

    peekMessageBody: function (mailAccountId, mailFolderId, id) {

        const me = this;

        if (arguments.length !== 3) {
            Ext.raise("Unexpected missing arguments");
        }

        return me.getMessageBody(mailAccountId, mailFolderId, id, false) !== null;
    },

    getMessageBody: function (mailAccountId, mailFolderId, id, autoCreate = true) {

        if (arguments.length < 3) {
            Ext.raise("Unexpected missing arguments");
        }

        var me = this,
            key = Ext.id(),
            message;

        me.invokeMessageFactory();


        if (!me.messageBodies) {
            me.messageBodies = {};
        }

        for (let i in me.messageBodies) {
            if (!Object.prototype.hasOwnProperty.call(me.messageBodies, i)) {
                continue;
            }
            if (me.messageBodies[i]["mailAccountId"] === mailAccountId &&
                me.messageBodies[i]["mailFolderId"] === mailFolderId &&
                me.messageBodies[i]["id"] + "" === id + "") {
                return me.messageBodies[i];
            }
        }

        if (autoCreate === false) {
            return null;
        }

        let mid =me.buildRandomNumber(0, me.messages.length - 1),
            peekItem = me.getMessageItem(mailAccountId, mailFolderId, id, false);

        if (peekItem && peekItem.subject && peekItem.subject.indexOf("eyeworkers") !== -1) {
            mid = 5;
        }
        message = this.messages[mid];

        me.messageBodies[key] = {
            id: id,
            mailFolderId: mailFolderId,
            mailAccountId: mailAccountId,
            textHtml: message,
            textPlain: this.rawMessages[mid]
        };

        return me.messageBodies[key];
    },


    /**
     * Computes the next DRAFT_KEY used for identifying a draft.
     * @returns {string}
     */
    getNextMessageDraftKey: function () {
        var me = this,
            drafts = me.getMessageDrafts(),
            items  = me.getMessageItems(),
            key = this.DRAFT_KEY, draftKey = 0, itemKey = 0;

        for (var i in drafts) {
            if (!Object.prototype.hasOwnProperty.call(drafts, i)) {
                continue;
            }
            draftKey++;
        }

        for (i in items) {
            if (!Object.prototype.hasOwnProperty.call(items, i)) {
                continue;
            }
            itemKey++;
        }

        key = Math.max(draftKey, itemKey, me.ITEM_LENGTH, this.DRAFT_KEY);

        this.DRAFT_KEY = ++key;

        return this.DRAFT_KEY + "";
    },


    getMessageDraft: function (mailAccountId, mailFolderId, id) {

        if (arguments.length !== 3) {
            Ext.raise("Unexpected missing arguments");
        }

        var me     = this,
            drafts = me.getMessageDrafts();

        for (var i in drafts) {
            if (!Object.prototype.hasOwnProperty.call(drafts, i)) {
                continue;
            }
            if (drafts[i]["mailAccountId"] === mailAccountId &&
                drafts[i]["mailFolderId"] === mailFolderId &&
                drafts[i]["id"] + "" === id + "") {
                return drafts[i];
            }
        }

        return null;
    },


    getMessageDrafts: function () {

        var me               = this,
            messageDrafts    = [],
            baseMessageItems = me.buildBaseMessageItems(),
            sender           = me.getSender();

        if (me.messageDrafts) {
            return me.messageDrafts;
        }

        for (var i in me.baseMessageItems) {

            if (!Object.prototype.hasOwnProperty.call(me.baseMessageItems, i)) {
                continue;
            }

            var bccAddresses = me.buildAddresses("bcc", i);

            messageDrafts[Ext.id()] = Ext.apply({
                bcc: bccAddresses,
                replyTo: i !== 0 && me.buildRandomNumber(0, 1)
                    ? sender[me.buildRandomNumber(0, sender.length - 1)]
                    : undefined
            }, baseMessageItems[i]);

        }

        me.messageDrafts = messageDrafts;

        return me.messageDrafts;
    },


    /**
     *
     * @param mailAccountId
     * @param mailFolderId
     * @param id
     * @param values
     * @param changeId true to create a new id for the draft, virtually removing the old.
     * This is for mocking IMAP behavior and their id changes
     */
    updateMessageDraft: function (mailAccountId, mailFolderId, id, values, changeId = false) {

        if (arguments.length < 3) {
            Ext.raise("Unexpected missing arguments");
        }


        var me = this;

        let draft = me.updateAllItemData(mailAccountId, mailFolderId, id, values, changeId);

        conjoon.dev.cn_mailsim.data.table.AttachmentTable.moveAttachments(
            mailAccountId, mailFolderId, id, {parentMessageItemId: draft.id}
        );

        return draft;

    },


    updateMessageItem: function (mailAccountId, mailFolderId, id, values, changeId = false) {

        if (arguments.length < 4) {
            Ext.raise("Unexpected missing arguments");
        }

        var me = this;

        let item = me.updateAllItemData(mailAccountId, mailFolderId, id, values, changeId);

        conjoon.dev.cn_mailsim.data.table.AttachmentTable.moveAttachments(
            mailAccountId, mailFolderId, id, {parentMessageItemId: item.id}
        );

        return item;
    },


    createMessageDraft: function (mailAccountId, mailFolderId, draftData) {

        if (arguments.length !== 3) {
            Ext.raise("Unexpected missing argument");
        }

        var me            = this,
            messageId     = Ext.id(),
            id            = me.getNextMessageDraftKey(),
            messageDrafts = me.getMessageDrafts(),
            messageItems  = me.getMessageItems(),
            date          = Ext.util.Format.date(new Date(), "Y-m-d H:i:s") + " +0000";

        //manually fake attachments and messageBody
        conjoon.dev.cn_mailsim.data.table.AttachmentTable.attachments[id] = null;

        var mb = me.getMessageBody(mailAccountId, mailFolderId, id);
        mb.textPlain = "";
        mb.textHtml = "";

        messageDrafts[id] = Ext.apply(draftData, {
            messageId: messageId,
            id: id,
            mailFolderId: mailFolderId,
            mailAccountId: mailAccountId,
            date: date
        });

        messageItems[id] = Ext.apply(draftData, {
            messageId: messageId,
            id: id,
            mailFolderId: mailFolderId,
            mailAccountId: mailAccountId,
            date: date
        });

        me.baseMessageItems[id] = Ext.apply(draftData, {
            messageId: messageId,
            id: id,
            mailFolderId: mailFolderId,
            mailAccountId: mailAccountId,
            date: date
        });


        // re init
        me.getMessageItems();
        me.getMessageDrafts();

        return messageDrafts[id];
    },


    /**
     *
     * @param mailAccountId
     * @param mailFolderId
     * @param id
     * @param values
     * @param idChange true to change the item and its associations under a new id
     * @returns {*}
     */
    updateAllItemData: function (mailAccountId, mailFolderId, id, values, idChange = false) {

        if (arguments.length < 4) {
            Ext.raise("Unexpected missing arguments");
        }

        var me     = this,
            draft  = me.getMessageDraft(mailAccountId, mailFolderId, id),
            item   = me.getMessageItem(mailAccountId, mailFolderId, id),
            dataItems = [draft, item],
            skipDate = false;

        let vals = [];

        for (let a in values) {
            if (!Object.prototype.hasOwnProperty.call(values, a)) {
                continue;
            }

            vals.push(a);
        }

        if (vals.indexOf("mailAccountId") !== -1 &&
            vals.indexOf("id") !== -1 &&
            vals.indexOf("mailFolderId") !== -1) {
            if (vals.length === 4  ||
                (vals.length === 5 && (vals.indexOf("seen") !== -1 || vals.indexOf("flagged") !== -1 || vals.indexOf("answered") !== -1))) {
                skipDate = true;
            }
        }

        // flag might be set by item sim without compound key info in vals
        if (vals.length === 1 && vals.indexOf("answered") !== -1) {
            skipDate = true;
        }

        if (values.mailFolderId && values.mailFolderId !== mailFolderId) {
            // make sure id changes since mail gets moved!

            idChange = true;
            let hasAtt = conjoon.dev.cn_mailsim.data.table.AttachmentTable.moveAttachments(
                mailAccountId, mailFolderId, id, {
                    mailFolderId: values.mailFolderId
                }
            );

            values.hasAttachments = hasAtt && hasAtt.length ? 1 : 0;

            me.updateMessageBody(mailAccountId, mailFolderId, id, {
                mailFolderId: values.mailFolderId
            }, true); // skip update to prevent possible recursion

        }

        for (var i = 0, len = dataItems.length; i < len; i++) {

            var currItem = dataItems[i];

            // possible that we landed from DraftAttachment Test here and that
            // items are not existing
            if (!currItem) {
                continue;
            }

            if (skipDate === false) {
                currItem["date"] = Ext.util.Format.date(new Date(), "Y-m-d H:i:s") + " +0000";
            }

            for (var prop in values) {

                if (!Object.prototype.hasOwnProperty.call(currItem, prop)) {
                    // we are updating an existing item with properties that might not
                    // existed previously - dont skip!
                    //continue;
                }

                switch (prop) {
                case "to":
                case "cc":
                case "bcc":
                case "from":
                case "replyTo":
                    if (Ext.isString(values[prop]))
                        currItem[prop] = Ext.JSON.decode(values[prop]);
                    break;
                case "date":
                    // already set above
                    break;
                default:
                    currItem[prop] = values[prop];
                    break;
                }


            }

        }
        if (idChange) {
            let newKey = me.getNextMessageDraftKey();
            // the mailFolder might have changed due to a move operation!
            me.changeIdFor(mailAccountId, item.mailFolderId, id, newKey);
        }


        return item;
    },


    changeIdFor: function (mailAccountId, mailFolderId, id, newKey) {


        if (!mailAccountId || !mailFolderId || !id || !newKey) {
            Ext.raise("missing or invalid argument!");
        }

        const me = this;

        let messageItems  = me.getMessageItems(),
            messageDrafts = me.getMessageDrafts(),
            messageBodies = me.messageBodies,
            i, item, body;

        for (i in messageItems) {
            if (!Object.prototype.hasOwnProperty.call(messageItems, i)) {
                continue;
            }
            item = messageItems[i];

            if (item["mailAccountId"] === mailAccountId &&
                item["mailFolderId"] === mailFolderId &&
                item["id"] + "" === id + "") {
                delete messageItems[i];
                item["id"] = newKey;
                messageItems[newKey] = item;
                break;
            }
        }


        for (i in messageDrafts) {
            if (!Object.prototype.hasOwnProperty.call(messageDrafts, i)) {
                continue;
            }
            item = messageDrafts[i];
            if (item["mailAccountId"] === mailAccountId &&
                item["mailFolderId"] === mailFolderId &&
                item["id"] + "" === id + "") {
                delete messageDrafts[i];
                item["id"] = newKey;
                messageDrafts[newKey] = item;
                break;
            }
        }

        for (i in messageBodies) {
            if (!Object.prototype.hasOwnProperty.call(messageBodies, i)) {
                continue;
            }
            body = messageBodies[i];
            if (body["mailAccountId"] === mailAccountId &&
                body["mailFolderId"] === mailFolderId &&
                body["id"] + "" === id + "") {
                delete messageBodies[i];
                body["id"] = newKey;
                messageBodies[newKey] = body;
                break;
            }
        }


    },


    getMessageItemAt: function (pos) {

        const me = this,
            messageItems = me.getMessageItems();

        let o = 0;
        for (var i in messageItems) {
            if (o++ === pos) {
                return messageItems[i];
            }
        }

        return null;
    },

    getMessageItem: function (mailAccountId, mailFolderId, id, autoCreate = true) {

        if (arguments.length < 3) {
            Ext.raise("Unexpected missing arguments");
        }
        var me    = this,
            items = autoCreate !== false ? me.getMessageItems() : (me.messageItems || []),
            found = null;

        for (var i in items) {
            if (!Object.prototype.hasOwnProperty.call(items, i)) {
                continue;
            }
            if (items[i]["mailAccountId"] === mailAccountId &&
                items[i]["mailFolderId"] === mailFolderId &&
                items[i]["id"] + "" === id + "") {
                found = items[i];
                break;
            }
        }

        return found;
    },


    getMessageItems: function () {

        var me               = this,
            AttachmentTable  = conjoon.dev.cn_mailsim.data.table.AttachmentTable,
            baseMessageItems = me.buildBaseMessageItems(),
            messageItems     = [];


        if (me.messageItems) {

            for (var i in me.messageItems) {

                if (!Object.prototype.hasOwnProperty.call(me.messageItems, i)) {
                    continue;
                }
                me.messageItems[i].previewText = me.buildPreviewText(
                    me.messageItems[i].mailAccountId,
                    me.messageItems[i].mailFolderId,
                    me.messageItems[i].id
                );
            }

            return me.messageItems;
        }

        for (i in baseMessageItems) {

            messageItems[Ext.id()] = Ext.apply({
                // leave first one as unread for tests
                hasAttachments: AttachmentTable.createRandomAttachments(
                    baseMessageItems[i].mailAccountId,
                    baseMessageItems[i].mailFolderId,
                    baseMessageItems[i].id
                ) ? 1 : 0,
                size: me.buildRandomSizeInBytes(),
                previewText: me.buildPreviewText(
                    baseMessageItems[i].mailAccountId,
                    baseMessageItems[i].mailFolderId,
                    baseMessageItems[i].id
                )
            }, baseMessageItems[i]);
        }

        me.messageItems = messageItems;

        return me.messageItems;
    },


    /**
     * Adds new message items to the table to mimic recent messages behavior.
     *
     * @param {Number} howMany the number of items to generate.
     * @param {String} mailFolderId The id of the mailFolder the items should be put into.
     */
    addRecentItems (howMany, mailFolderId) {

        const me = this;

        if (!me.messageItems) {
            return;
        }

        const date = Ext.Date.format(new Date(), "Y-m-d H:i:s") + " +0000";

        let i = 0;
        Object.values(me.messageItems).some(item => {
            if (i === howMany) {
                return true;
            }

            let newItem = Object.assign({}, item);

            newItem.recent = true;
            newItem.id = "" + me.recentId;
            newItem.mailFolderId = mailFolderId;
            newItem.date = date;

            me.messageItems[Ext.id()] = newItem;
            me.recentId++;
            i++;
        });

    },


    /**
     * @private
     */
    getSender  () {
        return [
            {address: "kontakt@eyeworkers.de",      name: "eyeworkers GmbH"},
            {address: "tsuckow@conjoon.org",        name: "tsuckow@conjoon.org"},
            {address: "ts@siteartwork.de",          name: "Thorsten"},
            {address: "demo@conjoon.org",           name: "conjoon demo"},
            {address: "info@conjoon.org",           name: "info@conjoon.org"},
            {address: "thorsten@suckow-homberg.de", name: "ThorstenSuckow"}
        ];
    },


    /**
     * @private
     */
    getSubjects () {
        return [
            "Die eyeworkers GmbH lädt Sie ein!",
            "Come travel with us! 🏝️",
            "🥡 The best food in town just got better! ",
            "Have you ever thought of building React Native Apps? Now is the time!",
            "Introducing: 10 tips to become a better Barista! ☕ Yum!",
            "An instant classic: React Native Apps and why Docusaurus 🦖 rules. Roar! "
        ];
    },


    /**
     * Builds the base message items to be used as the data for Sims.
     *
     * @return {Array}
     */
    buildBaseMessageItems: function () {
        const  me = this;

        if (me.baseMessageItems) {
            return me.baseMessageItems;
        }

        const
            sender = me.getSender(),
            subjects = me.getSubjects(),
            baseMessageItems = [];


        let mailFolderId, mailAccountId = ["dev_sys_conjoon_org", "mail_account"], mailFolders = [
                "INBOX",
                "INBOX.Sent Messages",
                "INBOX.Junk",
                "INBOX.Drafts",
                "INBOX.Trash"
            ], subject, emailSender;

        for (var i = 0; i < me.ITEM_LENGTH; i++) {

            mailFolderId = mailFolders[i % 5];

            subject = subjects[me.buildRandomNumber(0, subjects.length - 1)];

            if (subject.indexOf("eyeworkers") !== -1) {
                emailSender = sender[0];
            } else {
                emailSender = sender[me.buildRandomNumber(1, sender.length - 1)];
            }

            let cfg = {
                id: (i + 1) + "",
                date: me.buildRandomDate(i < 100),
                // leave first one as unread for tests
                subject: /*mailFolderId + '-' + (i) + '-' +*/ subject,
                from: i === 0
                    ? "john.smith@awesomewebsite.com"
                    : emailSender,
                to: me.buildAddresses("to", i),
                cc: me.buildAddresses("cc", i),
                mailFolderId: mailFolderId,
                mailAccountId: i >= (me.ITEM_LENGTH / 2) ? mailAccountId[1] : mailAccountId[0],
                testProp: i,
                messageId: Ext.id(),
                seen: i === 0 ? false : (me.buildRandomNumber(0, 1) ? true : false),
                draft: mailFolderId === "INBOX.Drafts"
                    ? true
                    : false
            };


            baseMessageItems.push(cfg);
        }

        me.baseMessageItems = baseMessageItems;

        return me.baseMessageItems;
    },


    resetAll: function () {
        const me = this;

        me.messageDrafts = me.baseMessageItems = me.messageItems = me.messageBodies = null;

        conjoon.dev.cn_mailsim.data.table.AttachmentTable.resetAll();

    }


});
