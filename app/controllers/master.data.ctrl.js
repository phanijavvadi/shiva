'use strict';

import logger from '../util/logger';
import * as commonUtil from '../util/common.util';
import * as masterDataService from '../services/master.data.service';
import models from '../models';

const sequelize = models.sequelize;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


const operations = {
  getOptions: (req, resp) => {
    const key = req.params.key;
    const options = {
      where: {
        key: key,
        status: 1
      }
    };
    return masterDataService
      .getOptions(options)
      .then((data) => {
        if (data) {
          resp.status(200).json(data);
        }
      }).catch((err) => {
        commonUtil.handleException(err, req, resp, next);
      });
  },
  importMasterData: (req, resp) => {
    models.MasterData.bulkCreate(req.body.data, {individualHooks: true})
      .then(() => {
        return resp.send('import completed successfully');
      }).catch((err) => {
      logger.info(err);
      resp.status(500).send('error');
    });
  },
};

export default operations;
