"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-param-reassign */

const { BaseResource , BaseRecord} = require("admin-bro");
const Property = require('sails-hook-adminjs-panel/src/adapter/property').default
const convertFilter = __importDefault(require("./utils/convert-filter"));
class Resource extends BaseResource {
    constructor(model) {
        super(model);
        this.ORMModel = model;
        const properties = [];
        let position = 0;
        Object.entries(model.attributes).forEach(([key, value]) => {
            const prop = new Property(key, value, position);
            position += 1;
            this.specificProperties = this.specificProperties ?? {};
            this.specificProperties[key] = prop;
            properties.push(prop);
        });
        this.resourceProperties = properties;
    }
    static isAdapterFor(rawResource) {
        return true;
    }
    rawAttributes() {
        return this.ORMModel.attributes;
    }
    databaseName() {
        return 'Models';
    }
    databaseType() {
        return 'Sails ORM';
    }
    name() {
        return this.ORMModel.tableName;
    }
    id() {
        return this.ORMModel.tableName;
    }
    properties() {
        return this.resourceProperties;
    }
    property(path) {
        return this.specificProperties[path]
    }
    referenceArrayProps() {
        let referenceArrayProps = [];
        this.properties().map((prop) => {
            const path = prop.path();
            if (prop.type() == 'reference' && prop.isArray() && path) {
                referenceArrayProps.push(prop);
            }
        });
        return referenceArrayProps;
    }
    async count(filter) {
        const hasIsDeleted = this.ORMModel.attributes?.isDeleted != undefined;
        return sails.hooks.orm.models[this.ORMModel.identity].count({ where: convertFilter.default(filter, hasIsDeleted) });
    }
    async find(filter, { limit = 20, offset = 0, sort = {} }) {
        let ormObjects;
        const sortTerm = sort?.sortBy ? `${sort.sortBy} ${sort.direction}` : undefined;
        const hasIsDeleted = this.ORMModel.attributes?.isDeleted != undefined;
        if (sortTerm) {
            ormObjects = await sails.hooks.orm.models[this.ORMModel.identity].find({ where: convertFilter.default(filter, hasIsDeleted) }).sort(sortTerm).skip(offset).limit(limit);
        } else {
            ormObjects = await sails.hooks.orm.models[this.ORMModel.identity].find({ where: convertFilter.default(filter, hasIsDeleted) }).skip(offset).limit(limit);
        }
        return ormObjects.map((ormObject) => new BaseRecord(ormObject , this));
    }
    async findOne(id) {
        const ormObject = await sails.hooks.orm.models[this.ORMModel.identity].findOne({ id: id });
        return new BaseRecord(ormObject, this);
    }
    async findMany(ids) {
        const ormObjects = await sails.hooks.orm.models[this.ORMModel.identity].find({ id: ids });
        return ormObjects.map((ormObject) => new BaseRecord(ormObject, this));
    }
    async findById(id) {
        const ormObject = await sails.hooks.orm.models[this.ORMModel.identity].findOne({ id: id });
        return new BaseRecord(ormObject, this);
    }
    async create(params) {
        const parsedParams = this.parseParams(params);
        console.log(`parsedParams: ${JSON.stringify(parsedParams)}`);
        const item = await sails.hooks.orm.models[this.ORMModel.identity].create(params);
        const baseItem = new BaseRecord(item, this);
        const json = baseItem.toJSON();
        return json;
    }
    async update(id, params) {
        const parsedParams = this.parseParams(params);
        //await this.updateAssociations(id, params); //To Implement when adding Array fields support
        return sails.hooks.orm.models[this.ORMModel.identity].updateOne({ id: id }).set(parsedParams);
    }
    async updateAssociations(id, params) {
        await this.properties().map(async (prop) => {
            const path = prop.path();
            if (prop.type() == 'reference' && prop.isArray() && path) {
                let associations = [];
                Object.entries(params).forEach(([key, value]) => {
                    if (key.startsWith(path) && key.length > path) {
                        associations.push(value);
                    }
                });
                if (associations.length > 0) {
                    await sails.hooks.orm.models[this.ORMModel.identity].replaceCollection(id, path).members(associations);
                }
            }
        });
    }
    async delete(id) {
        if (this.ORMModel.attributes.isDeleted) {
            return sails.hooks.orm.models[this.ORMModel.identity].updateOne({ id: id }).set({isDeleted: true});
        } else {
            await sails.hooks.orm.models[this.ORMModel.identity].destroyOne({ id: id });
        }
    }
    parseParams(params) {
        const parsedParams = Object.assign({}, params);
        this.properties().forEach((property) => {
            const value = parsedParams[property.name()];
            if (value === '') {
                if (property.isArray() || property.type() !== 'string') {
                    delete parsedParams[property.name()];
                }
            }
            if (!property.isEditable()) {
                delete parsedParams[property.name()];
            }
        });
        return parsedParams;
    }
}
exports.default = Resource;
