"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin_bro_1 = require("admin-bro");
const createValidationError = (originalError) => {
    const errors = Object.keys(originalError.errors).reduce((memo, key) => {
        const { path, message, validatorKey } = originalError.errors[key];
        memo[path] = { message, kind: validatorKey }; // eslint-disable-line no-param-reassign
        return memo;
    }, {});
    return new admin_bro_1.ValidationError(errors);
};
exports.default = createValidationError;
