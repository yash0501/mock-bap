"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("./config/config"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const PORT = config_1.default.get('port');
app.use('/on_search', require("./routes/v1/on_search"));
app.use('/on_select', require("./routes/v1/on_select"));
app.use('/on_init', require("./routes/v1/on_init"));
app.use('/on_confirm', require("./routes/v1/on_confirm"));
app.use('/on_track', require("./routes/v1/on_track"));
app.use('/on_cancel', require("./routes/v1/on_cancel"));
app.use('/on_update', require("./routes/v1/on_update"));
app.use('/on_status', require("./routes/v1/on_status"));
app.use('/on_rating', require("./routes/v1/on_rating"));
app.use('/on_support', require("./routes/v1/on_support"));
app.use('/trigger', require("./routes/v1/triggers"));
app.use('/admin', require("./routes/v1/admin"));
app.listen(PORT, () => {
    console.log("BAP listening on port " + PORT);
});
