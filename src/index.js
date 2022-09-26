/**
 * Module dependencies
 */
const requiredHooks = [
  'blueprints',
  'http',
  'orm',
  'policies',
  'views'
];

const AdminBroExpress = require('@admin-bro/express');
const express = require('express');
const AdminBro = require('admin-bro');
const WaterlineAdapter = require('./adapter/waterlineAdapter');
const path = require('path');
const defaultsObj = require('./lib/config/defaults');
const fs = require('fs');
AdminBro.registerAdapter(WaterlineAdapter);

const injectCrsfIfRequired = (originalResponse, request, context) => {
  if (sails.config.security.csrf) {
    //Inject csrf token if possible
    const csrf = request && request.csrfToken && request.csrfToken();
    originalResponse.record.params._csrf = csrf;
  }
  return originalResponse
}

function autoBindSailsModels(sails) {
  const resources = [];
  if (sails
    && sails.hooks
    && sails.hooks.orm
    && sails.hooks.orm.models) {
    const models = sails.hooks.orm.models;
    Object.entries(models).forEach(([key, value]) => {
      const prototype = Object.getPrototypeOf(value);
      if (prototype.hasSchema) {
        resources.push({
          resource: prototype,
          options: {
            actions: {
              edit: { after: [injectCrsfIfRequired] },
              delete: { after: [injectCrsfIfRequired] },
              bulkDelete: { after: [injectCrsfIfRequired] },
              new: { after: [injectCrsfIfRequired] }
            },
          },
        });
      }
    });
  }
  return resources;
}

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

module.exports = function (sails) {

  return {
    defaults: defaultsObj,

    initialize: async function (cb) {

      sails.log.info('Initializing adminBroJS hook... (sails-hook-adminbrojs)');

      // Check if configuration file is present, otherwise copy it
      try {
        const configFilePath = path.join(__dirname, '../../../config/adminjsPanel.js');
        const exists = fs.existsSync(configFilePath);
        if (!exists) {
          ensureDirectoryExistence(configFilePath);
          await fs.copyFile(path.join(__dirname, 'lib/config/defaults.js'), configFilePath, () => {});
          sails.log.info('[Sails Hook][adminJSPanel] : Success Adding the configuration file.');
        } else {
          sails.log.info('[Sails Hook][adminJSPanel] : Configuration file already present.');
        }        
      } catch (err) {
        sails.log.error(err);
      }

      // Check if js files presents, otherwise copy it
      try {
        const configFilePath = path.join(__dirname, '../../../assets/adminJSPanel/adminbro.js');
        const exists = fs.existsSync(configFilePath);
        if (!exists) {
          ensureDirectoryExistence(configFilePath);
          await fs.copyFile(path.join(__dirname, 'lib/config/adminbro.js'), configFilePath, () => { });
          sails.log.info('[Sails Hook][adminJSPanel] : Success Adding the adminJSPanel javascript file.');
        } else {
          sails.log.info('[Sails Hook][adminJSPanel] : adminJSPanel javascript file already present.');
        }
      } catch (err) {
        sails.log.error(err);
      }

      // Check if css files presents, otherwise copy it
      try {
        const configFilePath = path.join(__dirname, '../../../assets/adminJSPanel/adminbro.css');
        const exists = fs.existsSync(configFilePath);
        if (!exists) {
          ensureDirectoryExistence(configFilePath);
          await fs.copyFile(path.join(__dirname, 'lib/config/adminbro.css'), configFilePath, () => { });
          sails.log.info('[Sails Hook][adminJSPanel] : Success Adding the adminJSPanel CSS file.');
        } else {
          sails.log.info('[Sails Hook][adminJSPanel] : adminJSPanel CSS file already present.');
        }
      } catch (err) {
        sails.log.error(err);
      }
     
      const { routes, assets } = AdminBro.Router;

      sails.on('router:before', () => {
        
        const sailsModels = autoBindSailsModels(sails);
        
        const adminBro = new AdminBro({
          database: [],
          resources: sailsModels,
          rootPath: sails.config.adminJSPanel.rootPath,
          dashboard: {
            component: AdminBro.bundle('./lib/react/my-dashboard-component')
          },
          assets: {
            styles: ['/adminJSPanel/adminbro.css'],
            scripts: ['/adminJSPanel/adminbro.js'],
          },
          branding: {
            companyName: 'AdminJS-Panel',
            softwareBrothers: false,
            logo: '/images/logo.png',
          },
          ...(sails.config.adminJSPanel.adminJSOptions ?? {}),
        });


        const rootPath = adminBro.options.rootPath || '/admin';

        routes.forEach((route) => {
          const handler = async function (req, res, next) {
            const controller = new route.Controller({ admin: adminBro }, req.session && req.session.adminUser);
            const {
              params, query } = req;
            const method = req.method.toLowerCase();
            //req.body Contains the form fields. Lets parse them in payload. Better approach is to use formdible but to try it later on
            const payload = Object.assign(Object.assign({}, (req.fields || {})), (req.files || {}), (req.body || {}));

            const controllerParams = Object.assign(Object.assign({}, req), {
              params,
              query,
              payload,
              method
            });

            const html = await controller[route.action](controllerParams, res);
            if (route.contentType) {
              res.set({ 'Content-Type': route.contentType });
            }
            res.set({ 'Some-Info': 'Arnios, Okan Kurtulus' });
            if (html) {
              res.send(html);
            }
          };
          const authCheckedHandler = async function(req, res, next) {
            return sails.config.adminJSPanel.auth(req, res, () => {
              handler(req, res, next);
            });
          }
          const routerPath = `${rootPath}${route.path}`;
          // we have to change routes defined in AdminBro from {recordId} to :recordId
          const expressPath = routerPath.replace(/{/g, ':').replace(/}/g, '');
          const routePath = `${route.method} ${expressPath}`;

          sails.router.bind(expressPath, authCheckedHandler, route.method);
          sails.config.routes[routePath] = { csrf: false };
        });

        assets.forEach((asset) => {
          const routerPath = `${rootPath}${asset.path}`;
          const expressPath = routerPath.replace(/{/g, ':').replace(/}/g, '');
          const routePath = `GET ${expressPath}`;
          sails.router.bind(routePath, async (req, res) => {
            res.sendFile(path.resolve(asset.src));
          });
        });
      });

      return cb();
    },

    configure: function () {
      sails.log.info('Configure function is working for (sails-hook-adminbrojs)');
    },

    routes: {
      before: {
        'GET /*': function (req, res, next) {
          return next();
        },
      },
      after: {
        'GET /*': function (req, res, next) {
          return next();
        },
      },
    }

  };
};
