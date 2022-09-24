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

function autoBindSailsModels() {
  const resources = [];
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
            new: {  after: [injectCrsfIfRequired] } },
          },
        });
      }
  });
  return resources;
}

async function isUserSuperAdmin(req, res, next) {
  //Add some authentication here
  return true;
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
          await fs.copyFile(path.join(__dirname, 'lib/config/defaults.js'), configFilePath, () => {});
          sails.log.info('[Sails Hook][adminJSPanel] : Success Adding the configuration file.');
        } else {
          sails.log.info('[Sails Hook][adminJSPanel] : Configuration file already present.');
        }        
      } catch (err) {
        sails.log.error(err);
      }

      const { routes, assets } = AdminBro.Router;

      sails.on('router:before', () => {
        const sailsModels = autoBindSailsModels();

        const adminBro = new AdminBro({
          database: [],
          resources: sailsModels,
          rootPath: sails.config.adminJSPanel.rootPath,
          dashboard: {
            component: AdminBro.bundle('./lib/react/my-dashboard-component')
          },
          assets: {
            styles: ['/adminbro/adminbro.css'],
            scripts: ['/adminbro/adminbro.js'],
          },
          branding: {
            companyName: 'AdminJS-Panel',
            softwareBrothers: false,
            logo: '/images/logo.png',
          },
        });


        const rootPath = adminBro.options.rootPath || '/admin';

        routes.forEach((route) => {
          const handler = async function (req, res, next) {
            const controller = new route.Controller({ admin: adminBro }, req.session && req.session.adminUser);

            const isSuperAdmin = await isUserSuperAdmin(req, res, next);
            if (req.originalUrl.indexOf('asset') === -1 && !isSuperAdmin) {
              res.redirect('/');
            }

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
          const routerPath = `${rootPath}${route.path}`;
          // we have to change routes defined in AdminBro from {recordId} to :recordId
          const expressPath = routerPath.replace(/{/g, ':').replace(/}/g, '');
          const routePath = `${route.method} ${expressPath}`;
          sails.router.bind(expressPath, handler, route.method);
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
