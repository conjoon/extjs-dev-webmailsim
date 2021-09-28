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
 * This is a dummy class that takes care of requiring all sim definitions
 * from the data.mail.ajax.sim namespace for local development. Will call init()
 * on each sim once the classes where defined.
 */
Ext.define("conjoon.dev.cn_mailsim.data.mail.PackageSim", {
    requires: [
        "conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.AttachmentSim",
        "conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageItemSim",
        "conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.SendMessageSim",
        "conjoon.dev.cn_mailsim.data.mail.ajax.sim.folder.MailFolderSim",
        "conjoon.dev.cn_mailsim.data.mail.ajax.sim.account.MailAccountSim"
    ]
}, () => {

    conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.AttachmentSim.init();
    conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageItemSim.init();
    conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.SendMessageSim.init();
    conjoon.dev.cn_mailsim.data.mail.ajax.sim.folder.MailFolderSim.init();
    conjoon.dev.cn_mailsim.data.mail.ajax.sim.account.MailAccountSim.init();

});
