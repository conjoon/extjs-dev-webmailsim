# @conjoon/extjs-dev-webmailsim Documentation

**extjs-dev-webmailsim** is a **coon.js** package and is tagged as such in the
`package.json`:

```json
{
  "coon-js": {
    "package": {
      "autoLoad":  {
        "registerController": true
      },
      "config" : "${package.resourcePath}/extjs-dev-webmailsim.conf.json"
    }
  }
}
```

By default, this package's configuration can be found in this package's `resources` folder
in a file named `extjs-dev-webmailsim.conf.json`.

## What goes into a `extjs-dev-webmailsim` configuration?

The package intercepts outgoing network requests to all urls matching a specific
url-pattern. Additionally, you can configure whether the package's url intercepting should
be enabled or disabled - this makes it easier to use this package in environments where
you have to test for fully functional network behavior with real HTTP-requests and live- and mock-data should be used side-by-side.

The configuration file for this package has various entries representing entities and their endpoints:
`mailAccount`, `mailFolder`, `messageItem` and `attachment`:

```json
{
  "attachment": {
    "url": "https://ddev-ms-email.ddev.site/rest-api-email/api/v.*?/MailAccounts/(.+)/MailFolders/(.+)/MessageItems/(.+)/Attachments(/.*)?",
    "enabled": true,
    "delay": 250
  },
  "messageItem": {
    "url": "https://ddev-ms-email.ddev.site/rest-api-email/api/v.*?/MailAccounts/(.+)/MailFolders/(.+)/MessageItems(/.*)?",
    "enabled": true,
    "delay": 250
  },
  "mailFolder": {
    "url": "https://ddev-ms-email.ddev.site/rest-api-email/api/v.*?/MailAccounts/(.+)/MailFolders(/.*)?",
    "enabled": true,
    "delay": 250
  },
  "mailAccount": {
    "url": "https://ddev-ms-email.ddev.site/rest-api-email/api/v.*?/MailAccounts(/d+)?",
    "enabled": true,
    "delay": 250
  }
}
```
Each entry in the configuration can be configured with 

- `url` - In order to properly intercept outgoing requests to the services as described in
  [rest-api-mail](https://github.com/conjoon/rest-api-description), the package needs 
  to be configured with various regular expressions representing urls to catch.
  The package is pre-configured. For example, HTTP-requests to the following URLs are intercepted by this package:
   - `https://dev-ms-email.ddev.site/rest-api-email/api/v0/MailAccounts`
   - `https://dev-ms-email.ddev.site/rest-api-email/api/v1/MailAccounts/dev/MailFolders/INBOX.Sent/MessageItems/123`

- `enabled` - If this package is used with your development or production environment, intercepting urls can be enabled/disabled by changing the property `enabled`
  to either `true` or `false`.
- `delay` - the delay in milliseconds to mimic network latency

### Order of matching URLs
The Simmanager will consider url-matching in the order the urls are configured.
Make sure more specific regular expressions are defined first, followed by more common ones.

For example, the url `https://dev-ms-email.ddev.site/rest-api-email/api/v1/MailAccounts/dev/MailFolders/INBOX.Sent/MessageItems/123`
would be intercepted by the regular expression defined with `mailFolder` (because it is defined _at first_), although it should be intercepted by `messageItem`:

```json
{
  "mailFolder": {
    "url": "https://ddev-ms-email.ddev.site/rest-api-email/api/v.*?/MailAccounts/(.+)/MailFolders(/.*)?",
    "enabled": true,
    "delay": 250
  },
  "messageItem": {
    "url": "https://ddev-ms-email.ddev.site/rest-api-email/api/v.*?/MailAccounts/(.+)/MailFolders/(.+)/MessageItems(/.*)?",
    "enabled": true,
    "delay": 250
  }
}  
```

## Response Data
If a request was intercepted, static data is returned to mimic responses of backends
implementing the [REST API](https://github.com/conjoon/rest-api-description). The data returned
can be edited in this package's `src/data/table/MessageTable.js` and `src/data/table/AttachmentTable.js`.