"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.personIdSchema = exports.updatePersonSchema = exports.createPersonSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createPersonSchema = joi_1.default.object({
    firstName: joi_1.default.string().min(1).max(50).required(),
    lastName: joi_1.default.string().min(1).max(50).required(),
    email: joi_1.default.string().email().optional(),
    dateOfBirth: joi_1.default.date().optional(),
    placeOfBirth: joi_1.default.string().max(100).optional(),
    phoneNumber: joi_1.default.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    profilePhoto: joi_1.default.string().uri().optional(),
    parentIds: joi_1.default.array().items(joi_1.default.string().uuid()).max(2).optional(),
    spouseId: joi_1.default.string().uuid().optional(),
    notes: joi_1.default.string().max(1000).optional()
});
exports.updatePersonSchema = joi_1.default.object({
    firstName: joi_1.default.string().min(1).max(50).optional(),
    lastName: joi_1.default.string().min(1).max(50).optional(),
    email: joi_1.default.string().email().optional(),
    dateOfBirth: joi_1.default.date().optional(),
    placeOfBirth: joi_1.default.string().max(100).optional(),
    phoneNumber: joi_1.default.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    profilePhoto: joi_1.default.string().uri().optional(),
    notes: joi_1.default.string().max(1000).optional()
});
exports.personIdSchema = joi_1.default.string().uuid().required();
//# sourceMappingURL=personValidation.js.map