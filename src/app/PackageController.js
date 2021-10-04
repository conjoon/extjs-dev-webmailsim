/**
 * conjoon
 * extjs-dev-webmailsim
 * Copyright (C) 2019-2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-dev-webmailsim
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
 * PackageController for the extjs-dev-webmailsim packages.
 * Inits the simlets available with this package.
 */
Ext.define("conjoon.dev.cn_mailsim.app.PackageController", {

    extend: "coon.core.app.PackageController",

    requires: [
        "Ext.ux.ajax.SimManager",
        "conjoon.dev.cn_mailsim.data.AttachmentSim",
        "conjoon.dev.cn_mailsim.data.MailAccountSim",
        "conjoon.dev.cn_mailsim.data.MailFolderSim",
        "conjoon.dev.cn_mailsim.data.MessageItemSim",
        "conjoon.dev.cn_mailsim.data.SendMessageSim"
    ],

    /**
     * Initializes the package with the simlets.
     * @param app
     */
    init (app) {
        "use strict";

        const
            me = this,
            config = app.getPackageConfig(me);
        
        Object.entries({
            "conjoon.dev.cn_mailsim.data.AttachmentSim": config.attachment,
            "conjoon.dev.cn_mailsim.data.MessageItemSim": config.messageItem,
            "conjoon.dev.cn_mailsim.data.MailFolderSim": config.mailFolder,
            "conjoon.dev.cn_mailsim.data.MailAccountSim": config.mailAccount,
            "conjoon.dev.cn_mailsim.data.SendMessageSim": config.sendMessage
        }).forEach(([cls, config]) => {

            if (config.enabled)  {
                Ext.ux.ajax.SimManager.register(
                    Ext.create(cls, {
                        url: new RegExp(config.url, "im"),
                        delay: config.delay
                    })
                );
            }
             
        });

    }
});