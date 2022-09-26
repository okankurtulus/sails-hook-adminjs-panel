
# sails-hook-adminjs

Sails JS Hook to auto generate admin screens for models (Thanks to AdminJS)

# Sails Hook For Auto Generated Admin Panel (Using AdminJS)

Sails Hook for auto generated admin panel for sails v.1.0.0+. Sails JS is so powerfull but managing models and creating pages for basic crud operations sometimes can be an issue. That's why this hook is created. It creates admin panel for all models with crud operations and also supports filters and batch operations.

### Installation

`npm install --save sails-hooks-adminjs-panel`

# Dependencies

No dependency is required, just install the hook & it should work seamlessly with waterline orm. If you have other orm tool configured, you should also configure models to use related adapter. Please check [**AdminJS**](https://github.com/SoftwareBrothers/adminjs) for further information.

### Config Options and their description

When you install this hook in your sails project, it first start it detects if configuration file is present in your sails config directory or not, if not, then it will create config file with default options, which can be edited later. Options are:

* `rootPath` :

    This is the route where your adminpanel will be loaded. You can configure this parameter according to your requests. By default `localhost:1337/adminPanel` will be used.

* `auth` :

    auth hook function will be processed for each admin panel route, you can configure any authentication behaviour in this function.

* `adminJSOptions` :

    You can place any additional Admin JS Options like resource customization, branding options or localization parameters here. For further details please check   . [**Admin JS options**](https://github.com/SoftwareBrothers/adminjs/blob/master/src/adminjs-options.interface.ts#L53)

### Support for "isDeleted" field in Models

This hook is designed to support isDeleted field in models. You can append below lines to the `sails.config.models` file to implement isDeleted field for all your sails models. You can also implement isDeleted to some specific models, in this case the models having isDeleted field will be updated on delete.

```
module.exports.models = {
    ...
    attributes: {
        ...
        `isDeleted: { type: 'boolean', defaultsTo: false },`
    },
}
```

## License

MIT
