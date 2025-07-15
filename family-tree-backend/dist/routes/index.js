"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const persons_1 = __importDefault(require("./persons"));
const tree_1 = __importDefault(require("./tree"));
const router = (0, express_1.Router)();
// Mount route modules
router.use('/persons', persons_1.default);
router.use('/tree', tree_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map