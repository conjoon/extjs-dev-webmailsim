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
```json
{
    "development": {
        "uses": [
            "extjs-app-webmail",
            "extjs-app-imapuser",
            "extjs-dev-webmailsim",
            "extjs-dev-imapusersim"
        ]
    },
    "production": {
        "uses": [
            "extjs-app-webmail",
            "extjs-app-imapuser"
        ]
    }
}
```
In order to properly intercept outgoing requests to the services as described in **conjoon/rest-api-descriptions/rest-imap**,
the package needs to be configured with a regular expression representing the urls to catch.
The package is pre-configured so that it catches urls in the form of `https://php-ms-imapuser.ddev.site/rest-imap/api/v1/*`.
A custom configuration can be placed in the resources-folder of the application using the package.

The following is a snapshot of the configuration and not guaranteed to work in future versions. It should be used as
an example - consult the `package.json` for an up to date configuration. 
```json
{
    "mailAccount": {
        "url": "https://php-ms-imapuser.ddev.site/rest-imap/api/v.*?/\/MailAccounts(\/\\d+)?",
        "enabled": true,
        "delay": 250
    },
    "mailFolder": {
        "url": "https://php-ms-imapuser.ddev.site/rest-imap/api/v.*?/\/MailAccounts\/(.+)\/MailFolders(\/.*)?",
        "enabled": true,
        "delay": 250
    },
    "attachment": {
        "url": "https://php-ms-imapuser.ddev.site/rest-imap/api/v.*?/\/MailAccounts\/(.+)\/MailFolders\/(.+)\/MessageItems\/(.+)\/Attachments(\/.*)?",
        "enabled": true,
        "delay": 250
    },
    "messageItem": {
        "url": "https://php-ms-imapuser.ddev.site/rest-imap/api/v.*?/\/MailAccounts\/(.+)\/MailFolders\/(.+)\/MessageItems(\/.*)?",
        "enabled": true,
        "delay": 250
    },
    "sendMessage": {
        "url": "https://php-ms-imapuser.ddev.site/rest-imap/api/v.*?/\/SendMessage(\/\\d+)?",
        "enabled": true,
        "delay": 250
    }
}
```
If this package is used in your environment, intercepting urls can be enabled/disabled by changing the property `enabled`
to either `true` or `false`.
<br>Please refer to the documentation of [extjs-lib-core](https://github.com/coon-js/extjs-lib-core) on how to
create package-specific configurations.

## Dev
### Naming
The following naming conventions apply:

#### Namespace
`conjoon.dev.cn_mailsim.*`
#### Package name
`extjs-dev-webmailsim`
#### Shorthand to be used with providing aliases
`cn_mailsim`