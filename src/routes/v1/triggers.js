"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const utils_1 = require("./utils");
const router = express_1.default.Router();
router.post("/search", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const error = yield (0, utils_1.validateTriggerRequest)(req, "search");
    if (error.message) {
      return res.status(400).send({ error });
    }
    const transaction_id = yield (0, utils_1.initiateSearch)(req);
    yield (0, utils_1.wait)(parseInt(req.body.ttl || 0));
    const result = (0, utils_1.getResultsFromApp)(req, transaction_id);
    res.status(200).send(result);
  })
);
router.post("/:api", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const api = req.params.api;
    const error = yield (0, utils_1.validateTriggerRequest)(req, api);
    if (error.message) {
      return res.status(400).send({ error });
    }
    (0, utils_1.initiateCall)(req, api);
    yield (0, utils_1.wait)(parseInt(req.body.ttl || 0));
    const result = (0, utils_1.getResultsFromApp)(req, req.body.transaction_id);
    res.status(200).send(result);
  })
);
module.exports = router;
