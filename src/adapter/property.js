"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });

const { BaseProperty } = require("admin-bro");
class Property extends BaseProperty {
    constructor(key, value, position) {
        super({ path: key, position: position });
        this.key = key;
        this.value = value;
    }
    name() {
        return this.key;
    }
    isEditable() {
        return this.key != 'id' && !this.value.autoCreatedAt && !this.value.autoUpdatedAt && !this.key.match('isDeleted') && !this.isArray();
    }
    isVisible() {
        return !this.key.match('password') && !this.key.match('isDeleted') && !this.isArray();
    }
    isId() {
        return this.key == 'id' || this.value.autoMigrations?.autoIncrement;
    }
    reference() {
        return this.value.collection ?? this.value.model ?? null;
    }
    availableValues() {
        return this.value.autoMigrations?.isIn ?? null;
    }
    isArray() {
        return undefined != this.value.collection;
    }
    /**
     * @returns {PropertyType}
     */
    type() {
        var adminJSType = this.value.type;
        switch (this.value.type) {
            case 'string':
                adminJSType = 'string';
                break;
            case 'number':
                adminJSType = 'number';
                break;
            case 'boolean':
                adminJSType = 'boolean';
                break;
            case 'json':
                adminJSType = 'textarea';
                break;
            case 'ref':
                if (this.value.autoMigrations?.columnType == 'timestamp') {
                    adminJSType = 'datetime';
                }
            default:
                break;
        }
        if (this.value.collection || this.value.model) {
            adminJSType = 'reference';
        }
        return adminJSType;
    }

    isSortable() {
        const typeOfModel = this.type();
        return typeOfModel !== 'mixed' && typeOfModel !== 'reference' && !this.isArray();
    }
    isRequired() {
        return this.value.required ?? false;
    }
}
exports.default = Property;
