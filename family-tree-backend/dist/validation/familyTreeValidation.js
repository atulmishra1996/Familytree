"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.familyTreeIdSchema = exports.updateFamilyTreeSchema = exports.createFamilyTreeSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createFamilyTreeSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).required(),
    rootPersonIds: joi_1.default.array().items(joi_1.default.string().uuid()).optional()
});
exports.updateFamilyTreeSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).optional(),
    rootPersonIds: joi_1.default.array().items(joi_1.default.string().uuid()).optional()
});
exports.familyTreeIdSchema = joi_1.default.string().uuid().required();
//# sourceMappingURL=familyTreeValidation.js.map