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
const config_1 = __importDefault(require("../../config/config"));
const router = express_1.default.Router();
router.get("/settings", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send(config_1.default.stores.file.store);
  })
);
router.post("/settings", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      Object.keys(req.body).forEach((key) => {
        config_1.default.set(key, req.body[key]);
      });
      config_1.default.save(0);
      res.status(200).send(config_1.default.stores.file.store);
    } catch (error) {
      res.status(500).send(error.message);
    }
  })
);
module.exports = router;
