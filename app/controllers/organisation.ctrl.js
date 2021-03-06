'use strict';
import * as _ from 'lodash';
import moment from 'moment';
import models from '../models';
import logger from '../util/logger';
import errorMessages from '../util/constants/error.messages';
import successMessages from '../util/constants/success.messages';
import * as orgService from '../services/organisation.service';
import * as orgContactDetailService from '../services/org.contact.details.service';
import userAccessValidator from '../validators/user.access.validator';

import * as userService from '../services/user.service';
import * as userRoleService from '../services/user.role.service';
import * as orgSubscriptionService from '../services/org.subscription.service';
import * as userVerificationService from '../services/user.verification.service';
import constants from "../util/constants/constants";
import * as mailNotificationUtil from "../util/mail.notification.util";
import * as adminMailTemplate from "../templates/admin.mail.template";
import * as config from '../../config/config';

const sequelize = models.sequelize;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


const operations = {
  list: (req, resp) => {
    const {authenticatedUser} = req.locals;
    logger.info('About to get organisation list');

    const options = {
      attributes: ['id', 'name', 'phoneNo', 'address', 'status', 'fax']
    };
    options.where = {};

    if (req.query.searchText) {
      options.where = {
        [Op.or]: [{name: {[Op.iLike]: `%${req.query.searchText}%`}},
          {phoneNo: {[Op.iLike]: `%${req.query.searchText}%`}}]
      }
    }
    if (req.query.status) {
      options.where.status = +req.query.status;
    }
    /**
     * Filter organisations if user category is ORG_USER
     * */
    if (authenticatedUser.userCategory.value === 'ORG_USER') {
      options.where.id = _.map(authenticatedUser.userRoles, (role) => {
        return role.orgId;
      })
    }
    return orgService
      .findAll(req.query, options)
      .then((data) => {
        resp.status(200).json(data);
      }).catch((err) => {
        let message, status;
        if (err && errorMessages[err.message]) {
          status = 403;
          message = errorMessages[err.message];
        } else {
          logger.error(err);
          status = 500;
          message = errorMessages.SERVER_ERROR;
        }
        resp.status(status).send({
          success: false,
          message
        });
      });
  },
  getOptions: (req, resp) => {
    logger.info('About to get organisation options');
    const options = {
      where: {}
    };
    const {authenticatedUser} = req.locals;
    if (authenticatedUser.userCategory.value === 'ORG_USER') {
      options.where.id = _.map(authenticatedUser.userRoles, (role) => {
        return role.orgId;
      })
    }
    return orgService
      .getOptions(options)
      .then((data) => {
        resp.status(200).json(data);
      }).catch((err) => {
        let message, status;
        if (err && errorMessages[err.message]) {
          status = 403;
          message = errorMessages[err.message];
        } else {
          logger.error(err);
          status = 500;
          message = errorMessages.SERVER_ERROR;
        }
        resp.status(status).send({
          success: false,
          message
        });
      });
  },
  getDetails: (req, resp) => {

    const id = req.params.id;
    logger.info('About to get organisation details', id);
    let record = null;
    return userAccessValidator.isUserHasOrgAccess(req.locals, id)
      .then(() => {
        return orgService.findById(id, {
          include: [{
            attributes: {exclude: ['deletedAt', 'createdAt', 'updatedAt']},
            model: models.OrgContactDetails,
            required: false,
            as: 'contactDetails'
          }, {
            attributes: {exclude: ['deletedAt', 'createdAt', 'updatedAt']},
            model: models.OrgSubscription,
            required: false,
            as: 'subscriptions',
            include: [
              {
                model: models.SubscriptionType,
                as: 'subscriptionType'
              }
            ]
          }],
          order: [['subscriptions', 'createdAt', 'DESC']]
        });
      })
      .then((data) => {
        if (!data) {
          throw new Error('INVALID_ORG_ID');
        }
        return resp.status(200).json(data);
      }).catch((err) => {
        let message, status;
        if (err && errorMessages[err.message]) {
          status = 403;
          message = errorMessages[err.message];
        } else {
          logger.error(err);
          status = 500;
          message = errorMessages.SERVER_ERROR;
        }
        resp.status(status).send({
          success: false,
          message
        });
      });
  },
  get: (req, resp) => {
    const id = req.params.id;
    logger.info('About to get organisation ', id);
    let record = null;
    return userAccessValidator.isUserHasOrgAccess(req.locals, id)
      .then(() => {
        return orgService.findById(id);
      })
      .then((data) => {
        if (data) {
          record = data;
          return record.getContactDetails({
            attributes: {
              exclude: ['deletedAt', 'createdAt', 'updatedAt', 'createdBy'],
            },
            limit: 1,
          });

        } else {
          throw new Error('INVALID_ORG_ID');
        }
      }).then(contactDetails => {
        record = record.get({plain: true});

        record = _.extend(record, {
          contPerId: contactDetails[0].id,
          contPerFname: contactDetails[0].firstName,
          contPerLname: contactDetails[0].lastName,
          contPerEmail: contactDetails[0].email,
          contPerPhoneNo: contactDetails[0].phoneNo,
          contPerTypeId: contactDetails[0].userTypeId
        });

        resp.status(200).json(record);
      }).catch((err) => {
        let message, status;
        if (err && errorMessages[err.message]) {
          status = 403;
          message = errorMessages[err.message];
        } else {
          logger.error(err);
          status = 500;
          message = errorMessages.SERVER_ERROR;
        }
        resp.status(status).send({
          success: false,
          message
        });
      });
  },
  create: (req, resp) => {
    const organisation = req.body;
    logger.info('About to create organisation ', organisation);
    let {authenticatedUser} = req.locals;
    authenticatedUser = authenticatedUser || {};
    const orgDetails = {
      name: organisation.name,
      address: organisation.address,
      suburb: organisation.suburb,
      postcode: organisation.postcode,
      state: organisation.state,
      country: organisation.country || null,
      phoneNo: organisation.phoneNo || null,
      fax: organisation.fax || null,
      orgLogo: organisation.orgLogo || null,
      createdBy: authenticatedUser.id || null
    }
    const orgContPerDetails = {
      firstName: organisation.contPerFname,
      lastName: organisation.contPerLname,
      email: organisation.contPerEmail,
      phoneNo: organisation.contPerPhoneNo,
      createdBy: authenticatedUser.id,
      userTypeId: organisation.contPerTypeId,
    }
    return sequelize.transaction()
      .then((t) => {
        return orgService
          .create(orgDetails, {transaction: t})
          .then((org) => {
            orgContPerDetails.orgId = org.get('id');
            return orgContactDetailService.create(orgContPerDetails, {transaction: t});
          })
          .then((contDetails) => {
            t.commit();
            return resp.json({
              success: true,
              // data: resultObj,
              message: successMessages.ORG_CREATED
            });
          })
          .catch((err) => {
            t.rollback();

            let message, status;
            if (err && errorMessages[err.message]) {
              status = 403;
              message = errorMessages[err.message];
            } else {
              logger.error(err);
              status = 500;
              message = errorMessages.SERVER_ERROR;
            }
            resp.status(status).send({
              success: false,
              message
            });
          });
      });
  },
  signUp: (req, resp) => {
    const organisation = req.body;
    logger.info('About to create organisation ', organisation);
    let {authenticatedUser, contPerUserType} = req.locals;
    authenticatedUser = authenticatedUser || {};
    const orgDetails = {
      name: organisation.name,
      address: organisation.address,
      suburb: organisation.suburb,
      postcode: organisation.postcode,
      state: organisation.state,
      country: organisation.country || null,
      phoneNo: organisation.phoneNo || null,
      fax: organisation.fax || null,
      orgLogo: organisation.orgLogo || null,
      createdBy: authenticatedUser.id || null
    }
    const orgContPerDetails = {
      firstName: organisation.contPerFname,
      lastName: organisation.contPerLname,
      email: organisation.contPerEmail,
      phoneNo: organisation.contPerPhoneNo,
      createdBy: authenticatedUser.id,
      userTypeId: organisation.contPerTypeId,
    }
    const userData = {
      firstName: organisation.contPerFname,
      lastName: organisation.contPerLname,
      email: organisation.contPerEmail,
      phoneNo: organisation.contPerPhoneNo,
      userCategoryId: contPerUserType.userCategory.id
    }

    const userRole = {
      userCategoryId: contPerUserType.userCategory.id,
      userSubCategoryId: contPerUserType.userSubCategory.id,
      userTypeId: contPerUserType.id

    };
    let createdOrg, createdContDetails, createdUser, createdUserRole;
    return sequelize.transaction()
      .then((t) => {
        return orgService
          .create(orgDetails, {transaction: t})
          .then((org) => {
            createdOrg = org;
            orgContPerDetails.orgId = org.get('id');
            return orgContactDetailService.create(orgContPerDetails, {transaction: t});
          })
          .then((contDetails) => {
            createdContDetails = contDetails;
            return userService.create(userData, {transaction: t});
          })
          .then((user) => {
            createdUser = user;
            userRole.userId = user.get('id');
            userRole.orgId = createdOrg.get('id');
            return userRoleService.create(userRole, {transaction: t});
          })
          .then((userRole) => {
            createdUserRole = userRole;
            if (contPerUserType.userSubCategory.value === constants.userSubCategory.ORG_PRACTITIONERS) {
              return userVerificationService.create({
                userId: createdUser.get('id'),
                regNo: organisation.regNo,
                userRoleId: createdUserRole.get('id')
              }, {transaction: t});
            } else {
              return createdUserRole;
            }
          })
          .then(() => {

            let contentObj = adminMailTemplate.practiceSignupNotificationMailtoSuperAdmin({
              ...organisation,
              contPerUserType: req.locals.contPerUserType
            });
            mailNotificationUtil.sendMail({
              to: [{email: config.mailNotifications.admin.from, name: config.mailNotifications.admin.name}],
              body: contentObj.body,
              subject: contentObj.subject
            });
            t.commit();
            return resp.json({
              success: true,
              message: successMessages.ORG_SIGN_UP_SUCCESS
            });
          })
          .catch((err) => {
            t.rollback();
            let message, status;
            if (err && errorMessages[err.message]) {
              status = 403;
              message = errorMessages[err.message];
            } else {
              logger.error(err);
              status = 500;
              message = errorMessages.SERVER_ERROR;
            }
            resp.status(status).send({
              success: false,
              message
            });
          });
      });
  },
  contact: (req, resp) => {
    const body = req.body;
    logger.info('About to send contact us mail notification ', body);

    const contentObj = adminMailTemplate.contactUs({
      ...body
    });
    mailNotificationUtil.sendMail({
      to: [{email: config.mailNotifications.admin.from, name: config.mailNotifications.admin.name}],
      body: contentObj.body,
      subject: contentObj.subject
    });
    return resp.json({
      success: true,
      message: successMessages.CONTACT_MAIL_SENT_SUCCESS
    });
  },
  update: (req, resp) => {
    logger.info('About to update organisation ', organisation);
    const organisation = req.body;
    const orgDetails = {
      id: organisation.orgId,
      name: organisation.name,
      address: organisation.address,
      suburb: organisation.suburb,
      postcode: organisation.postcode,
      state: organisation.state,
      country: organisation.country,
      phoneNo: organisation.phoneNo,
      fax: organisation.fax,
      orgLogo: organisation.orgLogo || null
    }
    const orgContPerDetails = {
      id: organisation.contPerId,
      firstName: organisation.contPerFname,
      lastName: organisation.contPerLname,
      // email: organisation.contPerEmail,
      phoneNo: organisation.contPerPhoneNo,
      userTypeId: organisation.contPerTypeId,

    }
    return sequelize.transaction()
      .then((t) => {
        return userAccessValidator.isUserHasOrgAccess(req.locals, organisation.orgId)
          .then(() => {
            return orgService
              .update(orgDetails, {transaction: t})
          })
          .then((data) => {
            return orgContactDetailService.update(orgContPerDetails, {transaction: t});
          })
          .then((data) => {
            t.commit();
            return resp.json({
              success: true,
              message: successMessages.ORG_UPDATED
            });
          }).catch(function (err) {
            t.rollback();
            let message, status;
            if (err && errorMessages[err.message]) {
              status = 403;
              message = errorMessages[err.message];
            } else {
              logger.error(err);
              status = 500;
              message = errorMessages.SERVER_ERROR;
            }
            resp.status(status).send({
              success: false,
              message
            });
          });
      });
  },
  activate: (req, resp) => {
    const body = req.body;
    // check at least one active practitioner User exists and should have valid subscription
    return userAccessValidator.isUserHasOrgAccess(req.locals, req.body.orgId)
      .then(() => {
        return userRoleService.findActivePractitioner({
          where: {
            orgId: req.body.orgId
          }
        });
      })
      .then((userRole) => {
        if (!userRole) {
          throw new Error('ATLEAST_ONE_ACTIVE_PRACTITIONER_REQUIRED_TO_ACTIVATE_ORG');
        }
        logger.info('About to validate organisation has valid subscription', body);
        return orgSubscriptionService.findOne({
          where: {
            validUpTo: {
              $gte: moment()
            },
            status: 1,
            orgId: body.orgId
          }
        });
      })
      .then((subscription) => {
        if (!subscription) {
          throw new Error('ORG_NOT_HAS_VALID_SUBSCRIPTION');
        }
        logger.info('About to activate organisation', body);
        return orgService.update({
          id: body.orgId,
          status: 1
        }, {});
      })
      .then((res) => {
        resp.json({
          success: true,
          message: successMessages.ORG_UPDATED
        });
      })
      .catch((err) => {
        let message, status;
        if (err && errorMessages[err.message]) {
          status = 403;
          message = errorMessages[err.message];
        } else {
          logger.error(err);
          status = 500;
          message = errorMessages.SERVER_ERROR;
        }
        resp.status(status).send({
          success: false,
          message
        });
      });
  },
  inActivate: (req, resp) => {
    const data = {
      id: req.body.orgId,
      status: 2
    }
    logger.info('About to in activate organisation ', data);
    return userAccessValidator.isUserHasOrgAccess(req.locals, req.body.orgId)
      .then(() => {
        return orgService.update(data, {})
      })
      .then((res) => {
        resp.json({
          success: true,
          message: successMessages.ORG_UPDATED
        });
      })
      .catch((err) => {
        let message, status;
        if (err && errorMessages[err.message]) {
          status = 403;
          message = errorMessages[err.message];
        } else {
          status = 500;
          message = errorMessages.SERVER_ERROR;
        }
        resp.status(status).send({
          success: false,
          message
        });
      });
  }
}

export default operations;
