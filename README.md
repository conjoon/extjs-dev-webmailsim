# # @conjoon/extjs-dev-webmailsim  
This Sencha ExtJS NPM package contains mock data for development of [conjoon/extjs-app-webmail](https://github.com/conjoon/extjs-app-webmail).
When using this package, all backend requests of `extjs-app-webmail` will be replaced with mocks.

## Installation
```
npm install --save-dev @conjoon/extjs-dev-webmailsim  
```

If you want to develop with this package, run the `build:dev`-script afterwards:
```bash
npm run build:dev
```
Testing environment will then be available via

```bash
npm test
```

## Usage
Simply update the app.json of the conjoon-application
by specifying this package in the `uses`-property in either the `development` and/or `prodution` section:

*Example:*
```javascript
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
```

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