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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getItemPrice = exports.findProductBySku = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const parseCsv = (csv) => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index].trim();
            return obj;
        }, {});
    });
};
const findProductBySku = (sku) => __awaiter(void 0, void 0, void 0, function* () {
    const Path = path_1.default.join(process.cwd(), 'data', 'products.csv');
    const file = yield promises_1.default.readFile(Path, 'utf-8');
    const products = parseCsv(file);
    return products.find(p => p.SKU === sku) || null;
});
exports.findProductBySku = findProductBySku;
const getItemPrice = (itemName) => __awaiter(void 0, void 0, void 0, function* () {
    const Path = path_1.default.join(process.cwd(), 'data', 'pricing.csv');
    const file = yield promises_1.default.readFile(Path, 'utf-8');
    const prices = parseCsv(file);
    const item = prices.find(p => p.Item === itemName);
    if (item) {
        return { item: itemName, price: parseFloat(item.Price) };
    }
    else {
        return { item: itemName, price: null };
    }
});
exports.getItemPrice = getItemPrice;
