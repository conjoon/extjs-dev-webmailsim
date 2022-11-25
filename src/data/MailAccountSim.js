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
 * JsonSimlet for MailAccount-data.
 */
Ext.define("conjoon.dev.cn_mailsim.data.MailAccountSim", {

    extend: "conjoon.dev.cn_mailsim.data.EmailBaseSim",

    getMockAccounts: () => [{
        id: "dev_sys_conjoon_org",
        name: "conjoon developer",
        from: {name: "John Smith", address: "dev@conjoon.org"},
        replyTo: {name: "John Smith", address: "dev@conjoon.org"},
        inbox_type: "IMAP",
        inbox_address: "sfsffs.ffssf.sffs",
        inbox_port: 993,
        inbox_user: "inboxuser",
        inbox_password: "inboxpassword",
        inbox_ssl: true,
        outbox_address: "sfsffs.ffssf.sffs",
        outbox_port: 993,
        outbox_user: "outboxuser",
        outbox_password: "outboxpassword",
        outbox_secure: ["tls", "ssl"][Math.floor(Math.random() * (1 - 0 + 1)) + 0]

    }, {
        id: "mail_account",
        name: "google mail",
        from: {name: "Peter Parker", address: "demo@googlemail.com"},
        replyTo: {name: "Peter Parker", address: "demo@googlemail.com"},
        inbox_type: "IMAP",
        outbox_secure: ["tls", "ssl"][Math.floor(Math.random() * (1 - 0 + 1)) + 0]
    }],


    doGet: function (ctx) {
        const
            me = this,
            accounts = me.getMockAccounts();

        let ret = {};

        ret.responseText = Ext.JSON.encode({
            success: true,
            data: accounts
        });

        Ext.Array.forEach(me.responseProps, function (prop) {
            if (prop in me) {
                ret[prop] = me[prop];
            }
        });

        /* eslint-disable-next-line no-console */
        console.log("GET MailAccounts", ret);
        return ret;


    },


    doPut: function (ctx) {

        const me = this;

        let ret  = {},
            data = ctx.xhr.options.jsonData,
            id   = data.id,
            accounts = me.getMockAccounts();

        if (data.name === "FAILURE") {

            ret.responseText = Ext.JSON.encode({
                success: false
            });

        } else {

            for (let i = 0, len = accounts.length; i < len; i++) {
                if (accounts[i].id === id) {
                    if (data.from) {
                        data.from = Ext.decode(data.from);
                    }
                    if (data.replyTo) {
                        data.replyTo = Ext.decode(data.replyTo);
                    }
                    Ext.apply(accounts[i], data);
                }
            }

            ret.responseText = Ext.JSON.encode({
                success: true,
                data: data
            });
        }

        Ext.Array.forEach(me.responseProps, function (prop) {
            if (prop in me) {
                ret[prop] = me[prop];
            }
        });

        return ret;
    }

});
