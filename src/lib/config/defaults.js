/**
* AdminJS Panel Config
* (sails.config.adminJSPanel)
*
* These options is used to configure the params for the custom hook: adminjs-panel.
*
* > This file is mainly useful for configuring the parameters that used to generate
* > the admin panel.
*
* For all available options, see:
* https://github.com/okankurtulus/sails-hook-adminjs-panel
*/

module.exports = {
  adminJSPanel: {

    /***************************************************************************
    | Most of the time, the following options does not need to be changed.
    | However, you are free to change and make it fit to your project constraints.
    |
    | Support For "isDeleted"
    |
    | If you would like your models not to be deleted, please add "isDeleted" field
    | for them that is boolean and defaults to false. If you'd like isDeleted for all 
    | of your models, you can also add a new attribute, in config/models.js
    | as below:
    |
    | isDeleted: { type: 'boolean', defaultsTo: false },
    |
    ***************************************************************************/
   
    rootPath: '/adminPanel',          //The path where the admin page will serve, ex: localhost:1337/adminPanel
    auth: (req, res, next) => {       //Auth function called for each route. You can customize authentication
      return next();
    },
    adminJSOptions: {},              //You can place any additional admin JS options here. https://github.com/SoftwareBrothers/adminjs/blob/master/src/adminjs-options.interface.ts
  },
};
