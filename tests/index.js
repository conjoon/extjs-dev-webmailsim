var harness = new Siesta.Harness.Browser.ExtJS();

harness.configure({
    title          : 'dev-cn_mailsim',
    disableCaching : true,
    loaderPath     : {

        /**
         * ux
         */
        'Ext.ux' : "../../../../ext/packages/ux/src/",

        /**
         * Requirements
         */
        'coon.core' : '../../lib-cn_core/src',
        'conjoon.dev.cn_mailsim'   : '../src'
    },
    preload        : [
        conjoon.tests.config.paths.extjs.css.url,
        conjoon.tests.config.paths.conjoon.css.url,
        conjoon.tests.config.paths.extjs.js.url
    ]
});

harness.start({
        group : 'universal',
        items : [{
            group : 'app',
            items : [
                'src/app/PackageControllerTest.js'
            ]
        }, {
            group : 'data',
            items : [{
                group : 'mail',

                items : [{
                    group : 'ajax',
                    items : [{
                        group : 'sim',
                        items : [{
                            group : 'message',
                            items : [
                                'src/data/mail/ajax/sim/message/MessageTableTest.js'
                            ]
                        }]
                    }]
                }]
            }]
        }]
    });
