## @conjoon/extjs-dev-webmailsim ![MIT](https://img.shields.io/npm/l/@conjoon/extjs-dev-webmailsim) [![npm version](https://badge.fury.io/js/@conjoon%2Fextjs-dev-webmailsim.svg)](https://badge.fury.io/js/@conjoon%2Fextjs-dev-webmailsim)

This Sencha ExtJS NPM package contains mock data for development of [conjoon/extjs-app-webmail](https://github.com/conjoon/extjs-app-webmail).
When using this package, all backend requests of `extjs-app-webmail` will be replaced with mocks.

## Installation
```bash
$ npm install --save-dev @conjoon/extjs-dev-webmailsim  
```

If you want to develop with this package, run the `build:dev`-script afterwards:
```bash
$ npm run build:dev
```
Testing environment will then be available via

```bash
$ npm test
```

For using the package as an external dependency in an application, use
```bash
$ npm install --save-prod @conjoon/extjs-dev-webmailsim
```
In your `app.json`, add this package as a requirement, and make sure your ExtJS `workspace.json`
is properly configured to look up local repositories in the `node_modules`-directory.

Example (`workspace.json`) :
```json 
{
  "packages": {
    "dir": "${workspace.dir}/node_modules/@l8js,${workspace.dir}/node_modules/@conjoon,${workspace.dir}/node_modules/@coon-js,${workspace.dir}/packages/local,${workspace.dir}/packages,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name},${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-treegrid,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-base,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-ios,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-material,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-aria,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-neutral,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-classic,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-gray,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-crisp,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-crisp-touch,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-neptune,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-neptune-touch,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-triton,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-graphite,${workspace.dir}/node_modules/@sencha/ext-${toolkit.name}-theme-material,${workspace.dir}/node_modules/@sencha/ext-calendar,${workspace.dir}/node_modules/@sencha/ext-charts,${workspace.dir}/node_modules/@sencha/ext-d3,${workspace.dir}/node_modules/@sencha/ext-exporter,${workspace.dir}/node_modules/@sencha/ext-pivot,${workspace.dir}/node_modules/@sencha/ext-pivot-d3,${workspace.dir}/node_modules/@sencha/ext-ux,${workspace.dir}/node_modules/@sencha/ext-font-ios",
    "extract": "${workspace.dir}/packages/remote"
  }
}
```
## Usage
Simply update the app.json of the **conjoon**-application
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
In order to properly intercept outgoing requests to the services as described in **conjoon/rest-api-description/rest-api-email**,
the package needs to be configured with a regular expression representing the urls to catch.
The package is pre-configured so that it catches urls in the form of `https://php-ms-imapuser.ddev.site/rest-api-email/api/v1/*`.
A custom configuration can be placed in the resources-folder of the application using the package.

The following is a snapshot of the configuration and not guaranteed to work in future versions. It should be used as
an example - consult the `package.json` for an up to date configuration. 
```json
{
    "mailAccount": {
        "url": "https://php-ms-imapuser.ddev.site/rest-api-email/api/v.*?/\/MailAccounts(\/\\d+)?",
        "enabled": true,
        "delay": 250
    },
    "mailFolder": {
        "url": "https://php-ms-imapuser.ddev.site/rest-api-email/api/v.*?/\/MailAccounts\/(.+)\/MailFolders(\/.*)?",
        "enabled": true,
        "delay": 250
    },
    "attachment": {
        "url": "https://php-ms-imapuser.ddev.site/rest-api-email/api/v.*?/\/MailAccounts\/(.+)\/MailFolders\/(.+)\/MessageItems\/(.+)\/Attachments(\/.*)?",
        "enabled": true,
        "delay": 250
    },
    "messageItem": {
        "url": "https://php-ms-imapuser.ddev.site/rest-api-email/api/v.*?/\/MailAccounts\/(.+)\/MailFolders\/(.+)\/MessageItems(\/.*)?",
        "enabled": true,
        "delay": 250
    },
    "sendMessage": {
        "url": "https://php-ms-imapuser.ddev.site/rest-api-email/api/v.*?/\/SendMessage(\/\\d+)?",
        "enabled": true,
        "delay": 250
    }
}
```
If this package is used in your environment, intercepting urls can be enabled/disabled by changing the property `enabled`
to either `true` or `false`.
<br>Please refer to the documentation of [extjs-lib-core](https://github.com/coon-js/extjs-lib-core) on how to
create package-specific configurations.
