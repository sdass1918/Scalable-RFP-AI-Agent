"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rfpRoutes = void 0;
const express_1 = require("express");
const mainAgent_1 = require("../agents/mainAgent");
const router = (0, express_1.Router)();
exports.rfpRoutes = router;
router.post('/process', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('RFP processing request received...');
        const result = yield (0, mainAgent_1.runRfpProcess)();
        console.log('RFP processing finished.');
        res.json(result);
    }
    catch (error) {
        console.error('Error processing RFP:', error);
        res.status(500).json({ error: 'Failed to process RFP' });
    }
}));
