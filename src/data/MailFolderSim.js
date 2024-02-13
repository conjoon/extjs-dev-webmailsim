/**
 * This file is part of the conjoon/extjs-dev-webmailsim project.
 *
 * (c) 2019-2024 Thorsten Suckow-Homberg <thorsten@suckow-homberg.de>
 *
 * For full copyright and license information, please consult the LICENSE-file distributed
 * with this source code.
 */


/**
 * JsonSimlet for MailFolder-data.
 */
Ext.define("conjoon.dev.cn_mailsim.data.MailFolderSim", {

    extend: "conjoon.dev.cn_mailsim.data.EmailBaseSim",

    requires: [
        "conjoon.dev.cn_mailsim.data.table.MailFolderTable"
    ],

    getMockFolder: () => conjoon.dev.cn_mailsim.data.table.MailFolderTable.getFolders(),


    doGet: function (ctx) {

        const me            = this,
            keys = me.extractCompoundKey(ctx.url),
            mailAccountId = keys.mailAccountId;

        let ret = {};

        /* eslint-disable-next-line no-console */
        console.log("GET MailFolders", ctx);

        let filter;
        if (ctx.params.filter) {
            filter = JSON.parse(ctx.params.filter);
            filter = filter.IN.id;
            if (!filter) {
                throw new Error("unexpected filter configuration");
            }
        }


        let mailFolders = Ext.Array.filter(
            me.getMockFolder(),
            function (item) {
                return item.relationships.MailAccount.data.id === "" + mailAccountId &&
                    (filter ? filter.includes(item.id) : true);
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
