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

describe('conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTableTest', function(t) {

    t.requireOk('conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable', function() {

        const MessageTable = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable,
              ITEM_LENGTH = 10000;


        t.it("buildBaseMessageItems()", function(t) {

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


    });



});


