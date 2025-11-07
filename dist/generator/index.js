"use strict";
/**
 * Generator Module - Public API Exports
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAttributesString = exports.formatAttribute = exports.validateEntities = exports.validateEntity = exports.generateHTML = exports.CodeGenerator = void 0;
var CodeGenerator_1 = require("./CodeGenerator");
Object.defineProperty(exports, "CodeGenerator", { enumerable: true, get: function () { return CodeGenerator_1.CodeGenerator; } });
Object.defineProperty(exports, "generateHTML", { enumerable: true, get: function () { return CodeGenerator_1.generateHTML; } });
var validation_1 = require("./validation");
Object.defineProperty(exports, "validateEntity", { enumerable: true, get: function () { return validation_1.validateEntity; } });
Object.defineProperty(exports, "validateEntities", { enumerable: true, get: function () { return validation_1.validateEntities; } });
var Formatters_1 = require("./Formatters");
Object.defineProperty(exports, "formatAttribute", { enumerable: true, get: function () { return Formatters_1.formatAttribute; } });
Object.defineProperty(exports, "buildAttributesString", { enumerable: true, get: function () { return Formatters_1.buildAttributesString; } });
//# sourceMappingURL=index.js.map