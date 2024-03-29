/**
 * conjoon
 * extjs-dev-webmailsim
 * Copyright (C) 2019-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-dev-webmailsim
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
 * JsonSimlet for MailFolder-data.
 */
Ext.define("conjoon.dev.cn_mailsim.data.MailFolderSim", {

    extend: "conjoon.dev.cn_mailsim.data.EmailBaseSim",

    getMockFolder: () => [{
        id: "INBOX",
        name: "Inbox",
        unreadCount: 3787,
        folderType: "INBOX",
        data: [{
            id: "INBOX.Today",
            name: "Today",
            unreadCount: 2,
            data: [],
            folderType: "FOLDER",
            mailAccountId: "dev_sys_conjoon_org"
        }, {
            id: "INBOX.Last Week",
            name: "Last Week",
            data: [],
            unreadCount: 0,
            folderType: "FOLDER",
            mailAccountId: "dev_sys_conjoon_org"
        }],
        mailAccountId: "dev_sys_conjoon_org"
    }, {
        id: "INBOX.Sent Messages",
        name: "Sent",
        unreadCount: 0,
        folderType: "SENT",
        data: [],
        mailAccountId: "dev_sys_conjoon_org"
    }, {
        id: "INBOX.Junk",
        name: "Junk",
        unreadCount: 0,
        folderType: "JUNK",
        data: [],
        mailAccountId: "dev_sys_conjoon_org"
    }, {
        id: "INBOX.Drafts",
        name: "Drafts",
        unreadCount: 0,
        folderType: "DRAFT",
        data: [],
        mailAccountId: "dev_sys_conjoon_org"
    }, {
        id: "INBOX.Trash",
        name: "Trash",
        unreadCount: 5,
        folderType: "TRASH",
        data: [],
        mailAccountId: "dev_sys_conjoon_org"
    },
    //////////////////////////////
    {
        id: "INBOX",
        name: "Inbox",
        unreadCount: 3787,
        folderType: "INBOX",
        data: [],
        mailAccountId: "mail_account"

    }, {
        id: "INBOX.Sent Messages",
        name: "Sent",
        unreadCount: 0,
        folderType: "SENT",
        data: [],
        mailAccountId: "mail_account"
    }, {
        id: "INBOX.Junk",
        name: "Junk",
        unreadCount: 0,
        folderType: "JUNK",
        data: [],
        mailAccountId: "mail_account"
    }, {
        id: "INBOX.Drafts",
        name: "Drafts",
        unreadCount: 0,
        folderType: "DRAFT",
        data: [],
        mailAccountId: "mail_account"
    }, {
        id: "INBOX.Trash",
        name: "Trash",
        unreadCount: 5,
        folderType: "TRASH",
        data: [],
        mailAccountId: "mail_account"
    }],


    doGet: function (ctx) {

        const me            = this,
            keys = me.extractCompoundKey(ctx.url),
            mailAccountId = keys.mailAccountId;

        let ret = {};

        /* eslint-disable-next-line no-console */
        console.log("GET MailFolders", ctx);

        let mailFolders = Ext.Array.filter(
            me.getMockFolder(),
            function (item) {
                return item.mailAccountId === "" + mailAccountId;
            }
        );


        ret.responseText = Ext.JSON.encode({
            data: mailFolders
        });

        Ext.Array.forEach(me.responseProps, function (prop) {
            if (prop in me) {
                ret[prop] = me[prop];
            }
        });

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

        const me = this;

        let pt = url.split("/"),
            mailAccountId;

        pt.pop();
        mailAccountId = decodeURIComponent(pt.pop());

        const path = this.uriToUrl(url).toString();
        if (!path.endsWith("/MailAccounts")) {
            if (me.simletAdapter.validateMailAccountId(mailAccountId) !== true) {
                throw new Error("mailAccountId url mismatch");
            }
        }
        return {
            mailAccountId: mailAccountId
        };
    }


});
