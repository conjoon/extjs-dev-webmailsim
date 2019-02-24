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
Simply update the app.json of the conjoon-application
by specifying this package in the `requires`-property:

*Example:*
````javascript
"requires": [
        "font-awesome",
        "lib-cn_comp",
        "app-cn_mail",
        "dev-cn_mailsim",
        "theme-cn_default"
    ]
````