"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const rfpRoutes_1 = require("./routes/rfpRoutes");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/rfp', rfpRoutes_1.rfpRoutes);
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
