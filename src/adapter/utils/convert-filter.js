"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const escape_regexp_1 = __importDefault(require("escape-regexp"));
const convertFilter = (filter, hasIsDeleted) => {
    let result = {};
    if (filter) {
        result = filter.reduce((memo, filterProperty) => {
            const { property, value, path: filterPath } = filterProperty;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, index] = filterPath.split('.');
            const previousValue = memo[property.name()] || {};
            switch (property.type()) {
                case 'string': {
                    const currentFilterValues = memo[filterPath] ?? {};
                    memo[filterPath] = { ...currentFilterValues, contains: `${escape_regexp_1.default(value)}` }
                    return memo;
                }
                case 'number': {
                    if (!Number.isNaN(Number(value))) {
                        return Object.assign({ [property.name()]: Number(value) }, memo);
                    }
                    return memo;
                }
                case 'date':
                case 'datetime': {
                    if (value.from || value.to) {
                        return Object.assign({ [property.name()]: Object.assign(Object.assign({}, value.from && { '>=': new Date(value.from) }), value.to && { '<=': new Date(value.to) }) }, memo);
                    }
                    break;
                }
                default:
                    break;
            }
            return Object.assign({ [property.name()]: value }, memo);
        }, {});
    }
    const whereClause = hasIsDeleted ? { isDeleted: false, ...result } : result;
    return whereClause;
};
exports.default = convertFilter;
