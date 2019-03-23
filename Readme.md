# dev-cn_mailsim  [![Build Status](https://travis-ci.org/conjoon/dev-cn_mailsim.svg?branch=master)](https://travis-ci.org/conjoon/dev-cn_mailsim)
This **Sencha ExtJS** package contains mock data for development of [conjoon/app-cn_mail](https://github.com/conjoon/app-cn_mail).
When using this package, all backend requests of app-cn_mail will be replaced with mocks.


## Naming
The following naming conventions apply:

#### Namespace
`conjoon.dev.cn_mailsim.*`
#### Package name
`dev-cn_mailsim`
#### Shorthand to be used with providing aliases
`cn_mailsim`

# Usage
## Requirements
This package requires the [lib-cn_core](https://github.com/coon-js/lib-cn_core) package of the [coon.js](https://github.com/coon-js) project.

# Usage
Simply update the app.json of the conjoon-application
by specifying this package in the `uses`-property in either the `development` and/or `prodution` section:

*Example:*
````javascript
"development": {
        "uses" : [
            "app-cn_imapuser",
            "app-cn_mail",
            "dev-cn_mailsim"
        ]
},
"production": {
        "uses" : [
            "app-cn_imapuser",
            "app-cn_mail"
        ]
}
````

Notice how in the example above all backend requests made by the [app-cn_mail](https://github.com/conjoon/app-cn_mail) package
will be intercepted by the backend-mocks of the `dev-cn_mailsim` package when using the development-version.