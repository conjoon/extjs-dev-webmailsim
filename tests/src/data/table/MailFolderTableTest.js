/**
 * conjoon
 * extjs-dev-webmailsim
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-dev-webmailsim
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

StartTest(t => {


    t.requireOk("conjoon.dev.cn_mailsim.data.table.MailFolderTable", function () {

        const MailFolderTable = conjoon.dev.cn_mailsim.data.table.MailFolderTable;

        t.it("get()", t => {

            t.expect(MailFolderTable.get("mail_account", "INBOX.Drafts").id).toBe("INBOX.Drafts");

            t.expect(MailFolderTable.get("dev_sys_conjoon_org", "INBOX.Last Week").attributes.folderType).toBe("FOLDER");

            t.expect(MailFolderTable.get("dev_sys_conjoon_org", "INBOX.Last Week.Last Year")
                .attributes.name).toBe("Last Week, but last year");

        });


    });});


