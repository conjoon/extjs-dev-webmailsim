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
 *
 */
Ext.define("conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable", {

    singleton: true,

    requires: [
        "conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.AttachmentTable"
    ],


    ITEM_LENGTH: 100,

    messageBodies: null,

    messageItems: null,

    baseMessageItems: null,

    DRAFT_KEY: 0,

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

        return me.getMessageBody(mailAccountId, mailFolderId, id).textPlain.substring(0, 200);
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
            name: "Firstname Lastname" + type,
            address: "name" + type + "@domain.tld"
        }, {
            name: "Firstname 1 Lastname 2" + type,
            address: "name1" + type + "@domain1.tld"
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

        const me = this,
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

            conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.AttachmentTable.moveAttachments(
                mailAccountId, mailFolderId, id, {parentMessageItemId: item.id}
            );
        }

        return message;
    },

    messages: [
        "<ul><li><img /><div style='background:black'>testmeclickyo</div>Blindtext <a href='mailto:dev@conjoon.org'><b> mail me @ conjoon</b></a> - Lorem <a href='http://www.conjoon.org'><b>conjoon</b></a> ipsum dolor sit amet, consectetuer adipiscing  elit. Aenean commodo ligula eget dolor. Aenean massa.</li><li>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, <br />pretium quis, sem.</li> <li>Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.</li> <li>In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt.</li></ul>",
        "<p>Text <a href='mailto:dev@conjoon.org'><b> mail me @ conjoon</b></a> here: Lorem ipsum dolor sit amet, <br />consectetuer <a href='http://www.conjoon.org'><b>conjoon</b></a> adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa <strong>strong</strong>. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, <br />aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede <a class=\"external ext\" href=\"#\">link</a> mollis pretium. Integer tincidunt. <br />Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, <br />porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi.</p>",
        "<blockquote><img />Following <a href='mailto:dev@conjoon.org'><b> mail me@conjoon.com</b></a> news! <a href='http://www.conjoon.org'><b>https://conjoon.org</b></a> Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa <strong>strong</strong>. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat <br />massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In <em>em</em> enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam <a class=\"external ext\" href=\"#\">link</a> dictum felis eu <br />pede mollis pretium. </blockquote>"
    ],

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

        message = this.messages[me.buildRandomNumber(0, 2)];

        me.messageBodies[key] = {
            id: id,
            mailFolderId: mailFolderId,
            mailAccountId: mailAccountId,
            textHtml: message,
            textPlain: Ext.util.Format.stripTags(message.replace(/<br \/>/g, "\n"))
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
            baseMessageItems = me.buildBaseMessageItems();

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
                    ? me.getSender()[me.buildRandomNumber(0, 5)]
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

        conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.AttachmentTable.moveAttachments(
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

        conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.AttachmentTable.moveAttachments(
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
        conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.AttachmentTable.attachments[id] = null;

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

        if (vals.indexOf("localId") !== -1 &&
            vals.indexOf("mailAccountId") !== -1 &&
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
            let hasAtt = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.AttachmentTable.moveAttachments(
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

    getMessageItem: function (mailAccountId, mailFolderId, id) {

        if (arguments.length !== 3) {
            Ext.raise("Unexpected missing arguments");
        }
        var me    = this,
            items = me.getMessageItems(),
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
            AttachmentTable  = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.AttachmentTable,
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
     * @private
     */
    getSender  () {
        return [
            {address: "tsuckow@conjoon.org", name: "conjoonadmin"},
            {address: "service@booking.com", name: "Booking.com"},
            {address: "info@ebay.de",        name: "ebay Verkäufer Team"},
            {address: "mailer@mtb-news.de",  name: "MTB News"},
            {address: "service@otto.de",     name: "Otto GmbH"},
            {address: "info@amazon.de",      name: "Amazon"}
        ];
    },


    /**
     * @private
     */
    getSubjects () {
        return [
            "Welcome to conjoon",
            "Re: Ihre Buchung in der Unterkunft",
            "Achtung! DVBT Antennen sind bald nutzlos, Thorsten Suckow-Homberg",
            "Verbindliche Bestellung Banshee Headbadge",
            "Vielen Dank für Ihre Bestellung",
            "Monte Walsh [Blu Ray] und mehr aus DVD & Blu Ray Klassiker"
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


        let mailFolderId, mailAccountId = "dev_sys_conjoon_org", mailFolders = [
            "INBOX",
            "INBOX.Sent Messages",
            "INBOX.Junk",
            "INBOX.Drafts",
            "INBOX.Trash"
        ];

        for (var i = 0; i < me.ITEM_LENGTH; i++) {

            mailFolderId = mailFolders[i % 5];

            let cfg = {
                id: (i + 1) + "",
                date: me.buildRandomDate(i < 100),
                // leave first one as unread for tests
                subject: /*mailFolderId + '-' + (i) + '-' +*/ subjects[me.buildRandomNumber(0, 5)],
                from: i === 0
                    ? "from@domain.tld"
                    : sender[me.buildRandomNumber(0, 5)],
                to: me.buildAddresses("to", i),
                cc: me.buildAddresses("cc", i),
                mailFolderId: mailFolderId,
                mailAccountId: mailAccountId,
                testProp: i,
                messageId: Ext.id(),
                seen: i === 0 ? false : (me.buildRandomNumber(0, 1) ? true : false),
                draft: mailFolderId === "INBOX.Drafts"
                    ? true
                    : i === 0 ? false : (me.buildRandomNumber(0, 1) ? true : false)
            };


            baseMessageItems.push(cfg);
        }

        me.baseMessageItems = baseMessageItems;

        return me.baseMessageItems;
    },


    resetAll: function () {
        const me = this;

        me.messageDrafts = me.baseMessageItems = me.messageItems = me.messageBodies = null;

        conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.AttachmentTable.resetAll();

    }


});