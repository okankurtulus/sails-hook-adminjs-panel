"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_bro_1 = require("admin-bro");
const Sails = require("sails/lib/app/Sails");
const resource_1 = __importDefault(require("./resource"));
class Database extends admin_bro_1.BaseDatabase {
    constructor(database) {
        super(database);
    }
    static isAdapterFor(database) {
        return true;
    }
    resources() {
        return [];
    }
}
exports.default = Database;
