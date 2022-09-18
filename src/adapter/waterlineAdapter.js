/**
 * Implementation of {@link BaseDatabase} for Sequelize Adapter
 *
 * @memberof module:@admin-bro/sequelize
 * @type {typeof BaseDatabase}
 * @static
 */
const Database = require('sails-hook-adminjs-panel/src/adapter/database').default

/**
 * Implementation of {@link BaseResource} for Sequelize Adapter
 *
 * @memberof module:@admin-bro/sequelize
 * @type {typeof BaseResource}
 * @static
 */
const Resource = require('sails-hook-adminjs-panel/src/adapter/resource').default

module.exports = { Database, Resource }
