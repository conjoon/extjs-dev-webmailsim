# # @conjoon/extjs-dev-webmailsim  
This Sencha ExtJS NPM package contains mock data for development of [conjoon/extjs-app-webmail](https://github.com/conjoon/extjs-app-webmail).
When using this package, all backend requests of `extjs-app-webmail` will be replaced with mocks.

## Installation
```
npm install --save-dev @conjoon/extjs-dev-webmailsim  
```

## Post-Install
[@coon-js/extjs-link](https://npmjs.org/coon-js/extjs-link) will start once the package was installed and guide you
through the process of creating symlinks to an existing ExtJS sdk installation.
This is only required if you want to run the tests (`./tests`), as [Siesta](https//npmjs.org/siesta-lite) relies on
an existing ExtJS installation.

## Usage
Simply update the app.json of the conjoon-application
by specifying this package in the `uses`-property in either the `development` and/or `prodution` section:

*Example:*
````javascript
"development": {
        "uses" : [
            "extjs-app-webmail",
            "extjs-app-imapuser",
            "extjs-dev-webmailsim"
        ]
},
"production": {
        "uses" : [
            "extjs-app-webmail",
            "extjs-app-imapuser"
        ]
}
````

Notice how in the example above all backend requests made by the [extjs-app-webmail](https://github.com/conjoon/extjs-app-webmail) package
will be intercepted by the backend-mocks of the `extjs-dev-webmailsim` package when using the development-version.


## Dev
### Naming
The following naming conventions apply:

#### Namespace
`conjoon.dev.cn_mailsim.*`
#### Package name
`extjs-dev-webmailsim`
#### Shorthand to be used with providing aliases
`cn_mailsim`