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

/**
 *
 */
Ext.define("conjoon.dev.cn_mailsim.data.table.MailFolderTable", {

    singleton: true,


    getFolders () {
        return [{
            id: "INBOX",
            type: "MailFolder",
            relationships: {
                MailAccount: {data: {type: "MailAccount", id: "dev_sys_conjoon_org"}}
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
                        MailAccount: {data: {type: "MailAccount", id: "dev_sys_conjoon_org"}}
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
                        MailAccount: {data: {type: "MailAccount", id: "dev_sys_conjoon_org"}}
                    },
                    attributes: {
                        id: "INBOX.Last Week",
                        name: "Last Week",
                        data: [{
                            type: "MailFolder",
                            id: "INBOX.Last Week.Last Year",
                            relationships: {
                                MailAccount: {data: {type: "MailAccount", id: "dev_sys_conjoon_org"}}
                            },
                            attributes: {
                                id: "INBOX.Last Week.Last Year",
                                name: "Last Week, but last year",
                                data: [],
                                unreadMessages: 0,
                                totalMessages: 0,
                                folderType: "FOLDER"
                            }
                        }],
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
                MailAccount: {data: {type: "MailAccount", id: "dev_sys_conjoon_org"}}
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
                MailAccount: {data: {type: "MailAccount", id: "dev_sys_conjoon_org"}}
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
                MailAccount: {data: {type: "MailAccount", id: "dev_sys_conjoon_org"}}
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
                MailAccount: {data: {type: "MailAccount", id: "dev_sys_conjoon_org"}}
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
                MailAccount: {data: {type: "MailAccount", id: "mail_account"}}
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
                MailAccount: {data: {type: "MailAccount", id: "mail_account"}}
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
                MailAccount: {data: {type: "MailAccount", id: "mail_account"}}
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
                MailAccount: {data: {type: "MailAccount", id: "mail_account"}}
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
                MailAccount: {data: {type: "MailAccount", id: "mail_account"}}
            },
            attributes: {
                name: "Trash",
                unreadMessages: 5,
                totalMessages: 234,
                folderType: "TRASH",
                data: []
            }
        }];
    },

    createDummy (mailAccountId, mailFolderId) {
        return {
            id: mailFolderId,
            type: "MailFolder",
            relationships: {
                MailAccount: {data: {type: "MailAccount", id: mailAccountId}}
            },
            attributes: {
                name: "Dummy",
                unreadMessages: 5,
                totalMessages: 234,
                folderType: "FOLDER",
                data: []
            }
        };
    },

    get (mailAccountId, mailFolderId) {

        if (!mailAccountId || !mailFolderId) {
            throw new Error("mailAccountId or mailFolderId must not be onitted");
        }

        const
            me = this,
            folders = me.getFolders();

        let found = null;

        const findFolder = folder => {
            if (folder.id === mailFolderId && folder.relationships.MailAccount.data.id === mailAccountId) {
                found = folder;
                return true;
            }
            // will return true if a child was found with the attributes, eventually
            // marking the currently scoped folder as found target, which must not be
            return folder && folder.attributes ? folder.attributes.data.find(findFolder) : false;
        };

        folders.find(findFolder);
        return found;
    }


});