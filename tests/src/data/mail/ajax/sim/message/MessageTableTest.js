/**
 * conjoon
 * dev-cn_mailsim
 * Copyright (C) 2020 Thorsten Suckow-Homberg https://github.com/conjoon/dev-cn_mailsim
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

describe('conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTableTest', function(t) {


    t.requireOk('conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable', function() {

        const MessageTable    = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable,
              AttachmentTable = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.AttachmentTable;

      MessageTable.ITEM_LENGTH = 5;


        t.beforeEach(function() {
            MessageTable.resetAll();
        });


        t.it("buildBaseMessageItems()", function(t) {

            const ITEM_LENGTH = MessageTable.ITEM_LENGTH;
            let items = MessageTable.buildBaseMessageItems(), i;

            t.expect(items.length).toBe(ITEM_LENGTH);


            for (i = 0; i < ITEM_LENGTH; i++) {
                if (!items[i].mailAccountId || !items[i].mailFolderId || !items[i].id) {
                    t.fail("Compound key information missing");
                }

                if (items[i].localId || items[i].messageBodyId) {
                    t.fail("client side key information available, though it should get created at the client.");
                }
            }

            t.expect(i).toBe(ITEM_LENGTH);


        });


        t.it("updateMessageDraft() - triggers new id", function(t) {

            let items = MessageTable.buildBaseMessageItems(), i;

            let data = {
                subject : "foo"
            };


            let draft = MessageTable.createMessageDraft("dev", "INBOX", data);

            let attachment = AttachmentTable.createAttachment(draft.mailAccountId, draft.mailFolderId, draft.id, {text : 'foo'});

            let mailAccountId = draft.mailAccountId,
                mailFolderId  = draft.mailFolderId,
                id            = draft.id;


            let newDraft = MessageTable.updateMessageDraft(
                draft.mailAccountId,
                draft.mailFolderId,
                draft.id,
                {subject : 'bar'},
                true
            );

            t.expect(draft).toBe(newDraft);

            t.expect(mailAccountId).toBe(newDraft.mailAccountId);
            t.expect(mailFolderId).toBe(newDraft.mailFolderId);
            t.expect(id).not.toBe(newDraft.id);

            t.expect(attachment.mailAccountId).toBe(newDraft.mailAccountId);
            t.expect(attachment.mailFolderId).toBe(newDraft.mailFolderId);
            t.expect(attachment.parentMessageItemId).toBe(newDraft.id);


            t.expect(MessageTable.peekMessageBody(mailAccountId, mailFolderId, id)).toBe(false);
            t.expect(MessageTable.peekMessageBody(draft.mailAccountId, draft.mailFolderId, draft.id)).toBe(true);

            t.expect(MessageTable.getMessageDraft(mailAccountId, mailFolderId, id)).toBe(null);
            t.expect(MessageTable.getMessageDraft(draft.mailAccountId, draft.mailFolderId, draft.id)).not.toBe(null);

            t.expect(MessageTable.getMessageItem(mailAccountId, mailFolderId, id)).toBe(null);
            t.expect(MessageTable.getMessageItem(draft.mailAccountId, draft.mailFolderId, draft.id)).not.toBe(null);

        });


        t.it("updateMessageBody() - triggers new id", function(t) {

            let items = MessageTable.buildBaseMessageItems();

            let data = {
                subject : "foo"
            };


            let draft = MessageTable.createMessageDraft("dev", "INBOX", data);

            let attachment = AttachmentTable.createAttachment(draft.mailAccountId, draft.mailFolderId, draft.id, {text : 'foo'});

            let mailAccountId = draft.mailAccountId,
                mailFolderId  = draft.mailFolderId,
                id            = draft.id;

            let messageBody = MessageTable.updateMessageBody(mailAccountId, mailFolderId, id, {textHtml : 'html'});

            t.expect(attachment.parentMessageItemId).toBe(messageBody.id);

            t.expect(mailAccountId).toBe(messageBody.mailAccountId);
            t.expect(mailFolderId).toBe(messageBody.mailFolderId);
            t.expect(id).not.toBe(messageBody.id);

            t.expect(MessageTable.peekMessageBody(mailAccountId, mailFolderId, id)).toBe(false);
            t.expect(MessageTable.peekMessageBody(messageBody.mailAccountId, messageBody.mailFolderId, messageBody.id)).toBe(true);

            t.expect(MessageTable.getMessageDraft(mailAccountId, mailFolderId, id)).toBe(null);
            t.expect(MessageTable.getMessageDraft(messageBody.mailAccountId, messageBody.mailFolderId, messageBody.id)).toBe(draft);

            t.expect(MessageTable.getMessageItem(mailAccountId, mailFolderId, id)).toBe(null);
            t.expect(MessageTable.getMessageItem(messageBody.mailAccountId, messageBody.mailFolderId, messageBody.id)).not.toBe(null);
        });


        t.it("createAttachment() - triggers new id", function(t) {

            let items = MessageTable.buildBaseMessageItems();

            let data = {
                subject : "foo"
            };


            let draft = MessageTable.createMessageDraft("dev", "INBOX", data);

            let mailAccountId = draft.mailAccountId,
                mailFolderId  = draft.mailFolderId,
                id            = draft.id;

            let attachment = AttachmentTable.createAttachment(mailAccountId, mailFolderId, id, {text : 'foo'});

            t.expect(attachment.text).toBe("foo");

            t.expect(mailAccountId).toBe(attachment.mailAccountId);
            t.expect(mailFolderId).toBe(attachment.mailFolderId);
            t.expect(id).not.toBe(attachment.parentMessageItemId);

            t.expect(MessageTable.peekMessageBody(mailAccountId, mailFolderId, id)).toBe(false);
            t.expect(MessageTable.peekMessageBody(attachment.mailAccountId, attachment.mailFolderId, attachment.parentMessageItemId)).toBe(true);

            t.expect(MessageTable.getMessageDraft(mailAccountId, mailFolderId, id)).toBe(null);
            t.expect(MessageTable.getMessageDraft(attachment.mailAccountId, attachment.mailFolderId, attachment.parentMessageItemId)).toBe(draft);

            t.expect(MessageTable.getMessageItem(mailAccountId, mailFolderId, id)).toBe(null);
            t.expect(MessageTable.getMessageItem(attachment.mailAccountId, attachment.mailFolderId, attachment.parentMessageItemId)).not.toBe(null);


            mailAccountId = attachment.mailAccountId;
            mailFolderId  = attachment.mailFolderId;
            id            = attachment.parentMessageItemId;

            t.expect(mailAccountId).toBe(draft.mailAccountId);
            t.expect(mailFolderId).toBe(draft.mailFolderId);
            t.expect(id).toBe(draft.id);

            let attachment2 = AttachmentTable.createAttachment(mailAccountId, mailFolderId, id, {text : 'bar'});
            t.expect(attachment2.text).toBe("bar");

            t.expect(id).not.toBe(attachment2.parentMessageItemId);

            let attachments = AttachmentTable.getAttachments(mailAccountId, mailFolderId, id);
            t.expect(attachments).toBe(null);

            attachments = AttachmentTable.getAttachments(attachment2.mailAccountId, attachment2.mailFolderId, attachment2.parentMessageItemId);
            t.expect(attachments[1]).toBe(attachment2);
            t.expect(attachments[0]).toBe(attachment);

        });


        t.it("deleteAttachment() - triggers new id", function(t) {

            let items = MessageTable.buildBaseMessageItems();

            let data = {
                subject : "foo"
            };


            let draft = MessageTable.createMessageDraft("dev", "INBOX", data);

            let mailAccountId = draft.mailAccountId,
                mailFolderId  = draft.mailFolderId,
                id            = draft.id;

            let attachment  = AttachmentTable.createAttachment(mailAccountId, mailFolderId, id, {text : 'foo'}),
                attachment2 = AttachmentTable.createAttachment(mailAccountId, mailFolderId, attachment.parentMessageItemId, {text : 'bar'});

            t.expect(mailAccountId).toBe(draft.mailAccountId);
            t.expect(mailFolderId).toBe(draft.mailFolderId);
            t.expect(id).not.toBe(draft.id);

            t.expect(draft.mailAccountId).toBe(attachment.mailAccountId);
            t.expect(draft.mailFolderId).toBe(attachment.mailFolderId);
            t.expect(draft.id).toBe(attachment.parentMessageItemId);

            t.expect(attachment2.mailAccountId).toBe(attachment.mailAccountId);
            t.expect(attachment2.mailFolderId).toBe(attachment.mailFolderId);
            t.expect(attachment2.parentMessageItemId).toBe(attachment.parentMessageItemId);

            let newId = attachment.parentMessageItemId;

            t.expect(newId).toBe(draft.id);

            let found = AttachmentTable.deleteAttachment(mailAccountId, mailFolderId, newId, attachment.id);

            t.expect(found).toEqual({"parentMessageItemId": "18", "mailAccountId": "dev", "mailFolderId": "INBOX"});

            t.expect(newId).not.toBe(draft.id);
            t.expect(newId).not.toBe(attachment2.parentMessageItemId);
            t.expect(draft.id).toBe(attachment2.parentMessageItemId);


            let attachments = AttachmentTable.getAttachments(mailAccountId, mailFolderId, draft.id);

            t.expect(attachments.length).toBe(1);
            t.expect(attachments[0]).toBe(attachment2);

        });


        t.it("correct date format for MessageDraft", function(t) {

            let items = MessageTable.buildBaseMessageItems(), i;

            let data = {
                subject : "foo"
            };

            let draft = MessageTable.createMessageDraft("dev", "INBOX", data);

            let regex = /^\d{4}\-\d{2}\-\d{2} \d{2}\:\d{2}\:\d{2} \+\d{4}/;

            t.expect(regex.test(draft.date)).toBe(true);

            let newDraft = MessageTable.updateMessageDraft(
                draft.mailAccountId,
                draft.mailFolderId,
                draft.id,
                {subject : 'bar'},
                true
            );

            t.expect(regex.test(newDraft.date)).toBe(true);

        });


    });});


