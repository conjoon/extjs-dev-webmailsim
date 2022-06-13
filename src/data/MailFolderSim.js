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

    extend: "Ext.ux.ajax.JsonSimlet",
    
    getMockFolder: () => [{
        id: "INBOX",
        type: "MailFolder",
        relationships: {
            MailAccounts: {data: {type: "MailAccount", id: "dev_sys_conjoon_org"}}
        },
        attributes: {
            name: "Inbox",
            unreadMessages: 3787,
            totalMessages: 400,
            folderType: "INBOX",
            data: [{
                type: "MailFolder",
                id: "INBOX.Today",
                relationships: {
                    MailAccounts: {data: {type: "MailAccount", id: "dev_sys_conjoon_org"}}
                },
                attributes: {
                    name: "Today",
                    unreadMessages: 2,
                    totalMessages: 10,
                    data: [],
                    folderType: "FOLDER"
                }
            }, {
                type: "MailFolder",
                id: "INBOX.Last Week",
                relationships: {
                    MailAccounts: {data: {type: "MailAccount", id: "dev_sys_conjoon_org"}}
                },
                attributes: {
                    id: "INBOX.Last Week",
                    name: "Last Week",
                    data: [],
                    unreadMessages: 0,
                    totalMessages: 0,
                    folderType: "FOLDER"
                }

            }]
        }
    }, {
        type: "MailFolder",
        id: "INBOX.Sent Messages",
        relationships: {
            MailAccounts: {data: {type: "MailAccount", id: "dev_sys_conjoon_org"}}
        },
        attributes: {
            name: "Sent",
            unreadMessages: 5,
            totalMessages: 10,
            folderType: "SENT",
            data: []
        }
    }, {
        type: "MailFolder",
        id: "INBOX.Junk",
        relationships: {
            MailAccounts: {data: {type: "MailAccount", id: "dev_sys_conjoon_org"}}
        },
        attributes: {
            name: "Junk",
            unreadMessages: 0,
            totalMessages: 0,
            folderType: "JUNK",
            data: []
        }
    }, {
        type: "MailFolder",
        id: "INBOX.Drafts",
        relationships: {
            MailAccounts: {data: {type: "MailAccount", id: "dev_sys_conjoon_org"}}
        },
        attributes: {
            name: "Drafts",
            unreadMessages: 0,
            totalMessages: 0,
            folderType: "DRAFT",
            data: []
        }
    }, {
        type: "MailFolder",
        id: "INBOX.Trash",
        relationships: {
            MailAccounts: {data: {type: "MailAccount", id: "dev_sys_conjoon_org"}}
        },
        attributes: {
            name: "Trash",
            unreadMessages: 5,
            totalMessages: 10,
            folderType: "TRASH",
            data: []
        }
    },
    //////////////////////////////
    {
        id: "INBOX",
        type: "MailFolder",
        relationships: {
            MailAccounts: {data: {type: "MailAccount", id: "mail_account"}}
        },
        attributes: {
            name: "Inbox",
            unreadMessages: 3787,
            totalMessages: 100032,
            folderType: "INBOX",
            data: []
        }
    }, {
        id: "INBOX.Sent Messages",
        type: "MailFolder",
        relationships: {
            MailAccounts: {data: {type: "MailAccount", id: "mail_account"}}
        },
        attributes: {
            name: "Sent",
            unreadMessages: 0,
            totalMessages: 0,
            folderType: "SENT",
            data: []
        }
    }, {
        id: "INBOX.Junk",
        type: "MailFolder",
        relationships: {
            MailAccounts: {data: {type: "MailAccount", id: "mail_account"}}
        },
        attributes: {
            name: "Junk",
            unreadMessages: 0,
            totalMessages: 0,
            folderType: "JUNK",
            data: []
        }
    }, {
        id: "INBOX.Drafts",
        type: "MailFolder",
        relationships: {
            MailAccounts: {data: {type: "MailAccount", id: "mail_account"}}
        },
        attributes: {
            name: "Drafts",
            unreadMessages: 0,
            totalMessages: 0,
            folderType: "DRAFT",
            data: []
        }
    }, {
        id: "INBOX.Trash",
        type: "MailFolder",
        relationships: {
            MailAccounts: {data: {type: "MailAccount", id: "mail_account"}}
        },
        attributes: {
            name: "Trash",
            unreadMessages: 5,
            totalMessages: 234,
            folderType: "TRASH",
            data: []
        }
    }],


    doGet: function (ctx) {

        const me            = this,
            keys = me.extractCompoundKey(ctx.url),
            mailAccountId = keys.mailAccountId;

        let ret = {};

        let mailFolders = Ext.Array.filter(
            me.getMockFolder(),
            function (item) {
                return item.relationships.MailAccounts.data.id === "" + mailAccountId;
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

        let pt = url.split("/"),
            mailAccountId;

        pt.pop();
        mailAccountId = pt.pop();

        return {
            mailAccountId: decodeURIComponent(mailAccountId)
        };
    }


});
