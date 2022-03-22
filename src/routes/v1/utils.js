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
exports.validateTriggerRequest = exports.initiateSearch = exports.initiateCall = exports.getResultsFromApp = exports.addResultToApp = exports.getMockResponse = exports.wait = exports.isValidUseCase = exports.getAllUseCases = exports.getAckResponse = void 0;
const axios_1 = __importDefault(require("axios"));
const lodash_1 = require("lodash");
const uuid_1 = require("uuid");
const promises_1 = __importDefault(require("fs/promises"));
const config_1 = __importDefault(require("../../config/config"));
const getAckResponse = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const res_data = yield promises_1.default.readFile(`./../mock_json_files/ack.json`, 'utf-8');
    const ack = JSON.parse(res_data);
    if (req.body.context) {
        ack.context = req.body.context;
    }
    ack.context.timestamp = new Date().toISOString();
    return ack;
});
exports.getAckResponse = getAckResponse;
function combineURLs(baseURL, relativeURL) {
    return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
}
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getAllUseCases = () => __awaiter(void 0, void 0, void 0, function* () {
    const dir = yield promises_1.default.readdir('./../mock_json_files', { withFileTypes: true });
    const domains = dir.filter(d => d.isDirectory() && d.name !== 'generic_jsons').map(d => d.name);
    let use_cases = {};
    for (let index = 0; index < domains.length; index++) {
        const domain = domains[index];
        const dir = yield promises_1.default.readdir('./../mock_json_files/' + domain, { withFileTypes: true });
        const apis = dir.filter(d => d.isDirectory()).map(d => d.name);
        use_cases[domain] = [];
        for (let index = 0; index < apis.length; index++) {
            const api = apis[index];
            const dir = yield promises_1.default.readdir(`./../mock_json_files/${domain}/${api}`);
            const use_case = dir.filter(s => s.endsWith('.json')).map(s => `${api}/${s.slice(0, -5)}`);
            use_cases[domain] = use_cases[domain].concat(use_case);
        }
    }
    return use_cases;
});
exports.getAllUseCases = getAllUseCases;
const isValidUseCase = (domain, use_case) => __awaiter(void 0, void 0, void 0, function* () {
    const all_use_cases = yield (0, exports.getAllUseCases)();
    if (Object.keys(all_use_cases).includes(domain)) {
        return (all_use_cases[domain].includes(use_case));
    }
    else {
        return false;
    }
});
exports.isValidUseCase = isValidUseCase;
const wait = (delay_ms) => __awaiter(void 0, void 0, void 0, function* () {
    if (delay_ms !== 0) {
        yield delay(delay_ms);
    }
});
exports.wait = wait;
const getMockResponse = (domain, use_case, api) => __awaiter(void 0, void 0, void 0, function* () {
    const use_case_api = use_case.split('/')[0];
    const file_path = use_case_api !== api ? `generic_jsons/${api}` : `${domain}/${use_case}`;
    const req_data = yield promises_1.default.readFile(`./../mock_json_files/${file_path}.json`, 'utf-8');
    const req_obj = JSON.parse(req_data);
    req_obj.context.domain = domain;
    req_obj.context.bap_uri = config_1.default.get('bap_uri');
    req_obj.context.bap_id = config_1.default.get('bap_id');
    req_obj.context.timestamp = new Date().toISOString();
    return req_obj;
});
exports.getMockResponse = getMockResponse;
const addResultToApp = (req) => __awaiter(void 0, void 0, void 0, function* () {
    let curr = req.app.get(req.body.context.transaction_id);
    if (curr === undefined || curr === null) {
        curr = [];
    }
    curr.push(req.body);
    req.app.set(req.body.context.transaction_id, curr);
});
exports.addResultToApp = addResultToApp;
const getResultsFromApp = (req, transaction_id) => {
    const result = req.app.get(transaction_id);
    req.app.set(transaction_id, null);
    return result;
};
exports.getResultsFromApp = getResultsFromApp;
const initiateCall = (req, api) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const domain = req.body.domain;
        const use_case = req.body.use_case;
        const bpp_uri = req.body.bpp_uri;
        const request = yield (0, exports.getMockResponse)(domain, use_case, api);
        request.context.transaction_id = req.body.transaction_id;
        const end_point = combineURLs(bpp_uri, `/${api}`);
        console.log(`${config_1.default.get('bap_id')} : ${request.context.transaction_id}  Sending ${api} to ${end_point}`);
        const res = yield axios_1.default.post(end_point, request, { headers: { use_case } });
    }
    catch (error) {
        console.log(`${config_1.default.get('bap_id')} ERROR : `, error);
    }
});
exports.initiateCall = initiateCall;
const initiateSearch = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const domain = req.body.domain;
        const use_case = req.body.use_case;
        const bpp_uri = req.body.bpp_uri;
        const bg_uri = config_1.default.get('bg_uri');
        const end_point = bpp_uri ? combineURLs(bpp_uri, '/search') : combineURLs(bg_uri, '/search');
        console.log(bpp_uri, end_point);
        const search_request = yield (0, exports.getMockResponse)(domain, use_case, 'search');
        for (var key in req.body) {
            if (req.body.hasOwnProperty(key) && key !== "domain" && key !== "use_case" && key !== "ttl") {
                (0, lodash_1.set)(search_request, key, req.body[key]);
            }
        }
        search_request.context.transaction_id = (0, uuid_1.v4)();
        console.log(`${config_1.default.get('bap_id')} : ${search_request.context.transaction_id}  Sending search to ${end_point}`);
        const res = yield axios_1.default.post(end_point, search_request, { headers: { use_case } });
        return search_request.context.transaction_id;
    }
    catch (error) {
        console.log(`${config_1.default.get('bap_id')} ERROR : `, error);
    }
});
exports.initiateSearch = initiateSearch;
const validateTriggerRequest = (req, api) => __awaiter(void 0, void 0, void 0, function* () {
    const allowedApis = ["search", "select", "init", "confirm", "update", "status", "track", "cancel", "feedback", "support"];
    if (!allowedApis.includes(api)) {
        console.log(`${config_1.default.get('bap_id')} ERROR : Invalid api ${api}`);
        return ({ message: `Only the following apis are allowed to be triggered:${allowedApis.toString()}` });
    }
    const { domain, use_case, bpp_uri, transaction_id } = req.body;
    if (domain === undefined || domain === "" || use_case === undefined || use_case === "") {
        console.log(`${config_1.default.get('bap_id')} ERROR : Invalid inputs domain and usecase required`);
        const all_use_cases = yield (0, exports.getAllUseCases)();
        return ({ message: `domain and use_case are required inputs`, supported_use_cases_and_domains: all_use_cases });
    }
    if (api !== 'search') {
        if (bpp_uri === undefined || bpp_uri === "") {
            console.log(`${config_1.default.get('bap_id')} ERROR : Invalid inputs bpp_uri required`);
            return ({ message: `bpp_uri is a required input` });
        }
        if (transaction_id === undefined || transaction_id === "") {
            console.log(`${config_1.default.get('bap_id')} ERROR : Invalid inputs transaction_id required`);
            return ({ message: `transaction_id is a required input` });
        }
    }
    const valid_use_case = yield (0, exports.isValidUseCase)(req.body.domain, req.body.use_case);
    if (!valid_use_case) {
        const use_cases = yield (0, exports.getAllUseCases)();
        console.log(`${config_1.default.get('bap_id')} ERROR : Invalid domain/use case`);
        return ({ message: "Invalid domain/use case. Please select a valid one", use_cases });
    }
    if (!use_case.split('/')[0].includes(api)) {
        return ({ message: `The specified use case (${use_case.split('/')[0]}) and triggered api (${api}) do not match` });
    }
    return ({ message: '' });
});
exports.validateTriggerRequest = validateTriggerRequest;
