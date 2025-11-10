"use strict";
/**
 * Generator Module Exports
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeAstro = exports.generateHTML = exports.CodeGenerator = void 0;
var CodeGenerator_1 = require("./CodeGenerator");
Object.defineProperty(exports, "CodeGenerator", { enumerable: true, get: function () { return CodeGenerator_1.CodeGenerator; } });
Object.defineProperty(exports, "generateHTML", { enumerable: true, get: function () { return CodeGenerator_1.generateHTML; } });
var AstroMerger_1 = require("./AstroMerger");
Object.defineProperty(exports, "mergeAstro", { enumerable: true, get: function () { return AstroMerger_1.mergeAstro; } });
__exportStar(require("./types"), exports);
__exportStar(require("./validation"), exports);
//# sourceMappingURL=index.js.map