/**
 * conjoon
 * dev-cn_mailsim
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/dev-cn_mailsim
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
 * Ext.ux.ajax.SimManager hook for {@link conjoon.dev.cn_mailsim.model.mail.folder.MailFolder}
 * data.
 */
Ext.define('conjoon.dev.cn_mailsim.data.mail.ajax.sim.folder.MailFolderSim', {

    requires : [
        'conjoon.dev.cn_mailsim.data.mail.ajax.sim.Init'
    ]

}, function() {

    var folders =   [{
        id            : "INBOX",
        name          : 'Inbox',
        unreadCount   : 3787,
        cn_folderType          : 'INBOX',
        data      : [{
            id            : "INBOX.MyStuff",
            name          : 'MyStuff',
            unreadCount   : 3787,
            cn_folderType          : 'INBOX',
            data      : [],
            mailAccountId :  "dev_sys_conjoon_org",
        }],
        mailAccountId :  "dev_sys_conjoon_org",
    }, {
        id            : "INBOX.Sent Messages",
        name          : 'Sent',
        unreadCount   : 0,
        cn_folderType          : 'SENT',
        data      : [],
        mailAccountId :  "dev_sys_conjoon_org",
    }, {
        id            : "INBOX.Junk",
        name          : 'Junk',
        unreadCount   : 0,
        cn_folderType          : 'JUNK',
        data      : [],
        mailAccountId :  "dev_sys_conjoon_org",
    }, {
        id            : "INBOX.Drafts",
        name          : 'Drafts',
        unreadCount   : 0,
        cn_folderType          : 'DRAFT',
        data      : [],
        mailAccountId :  "dev_sys_conjoon_org",
    }, {
        id           : "INBOX.Trash",
        name         : 'Trash',
        unreadCount  : 5,
        cn_folderType         : 'TRASH',
        data     : [],
        mailAccountId :  "dev_sys_conjoon_org",
    },
    //////////////////////////////
    {
        id            : "INBOX",
        name          : 'Inbox',
        unreadCount   : 3787,
        cn_folderType          : 'INBOX',
        data      : [],
        mailAccountId :  "mail_account",

    }, {
        id            : "INBOX.Sent Messages",
        name          : 'Sent',
        unreadCount   : 0,
        cn_folderType          : 'SENT',
            data      : [],
        mailAccountId :  "mail_account",
    }, {
        id            : "INBOX.Junk",
        name          : 'Junk',
        unreadCount   : 0,
        cn_folderType          : 'JUNK',
            data      : [],
        mailAccountId :  "mail_account",
    }, {
        id            : "INBOX.Drafts",
        name          : 'Drafts',
        unreadCount   : 0,
        cn_folderType          : 'DRAFT',
            data      : [],
        mailAccountId :  "mail_account",
    }, {
        id           : "INBOX.Trash",
        name         : 'Trash',
        unreadCount  : 5,
        cn_folderType         : 'TRASH',
            data     : [],
        mailAccountId :  "mail_account"
    }];



    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url : /cn_mail\/MailAccounts\/(.+)\/MailFolders(\/.*)?/im,

        doGet: function(ctx) {

            const me            = this,
                  keys = me.extractCompoundKey(ctx.url),
                  mailAccountId = keys.mailAccountId;

            ret = {};

            let mailFolders = Ext.Array.filter(
                folders,
                function(item) {
                    return item.mailAccountId === '' + mailAccountId;
                }
            );


            ret.responseText = Ext.JSON.encode({
                data :  mailFolders
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
        extractCompoundKey : function(url) {

            let pt = url.split('/'),
                mailAccountId;


            mailAccountId = pt.pop();
            mailAccountId = pt.pop();

            return {
                mailAccountId : decodeURIComponent(mailAccountId)
            };
        }




    });

});