'use strict';

import models from '../models';

const Organization = models.Organization;

/**
 * Find all organizations in the db
 *
 **/
export function findAll({limit = 50, offset = 0, ...otherOptions} = {}) {
  return Organization.findAndCountAll({
    attributes: {
      exclude: ['deletedAt'],
      include: [...otherOptions.include || {}],
    },
    include: [{
      model: models.OrgUserType,
      required: true,
      attributes: {
        exclude: ['deletedAt', 'createdAt', 'updatedAt']
      },
    }],
    limit: Number(limit),
    offset: Number(offset),
    where: {
      ...otherOptions
    }
  });
};
/**
 * get organization options list
 *
 **/
export function getOptions() {
  return Organization.findAll({
    attributes: ['id','organizationName']
  });
};

/**
 * Find a organization by organization id
 * @param organizationId
 **/
export function findById(id, options = {}) {
  let includeTables = [];
  if (options.includeOrgUserType) {
    includeTables.push({
      model: models.OrgUserType,
      attributes: {
        exclude: ['updatedAt', 'createdAt', 'deletedAt']
      }
    });
  }
  return Organization.findOne({
    attributes: {
      exclude: ['password'],
      include: [...options.include || {}],
    },
    include: includeTables,
    where: {
      id: id
    }
  });
};

/**
 * Find a organization by organization id
 * @param organizationId
 **/
export function findOne(options = {}) {
  return Organization.findOne({
    attributes: {
      exclude: ['password'],
      include: [...options.include || {}],
    },
    where: {
      ...options
    }
  });
};


/**
 * Create a new organization
 * @param organization object literal containing info about a organization
 **/
export function create(organization) {
  return Organization.create(organization);
};

/**
 * Update a organization
 * @param organization object literal containing info about a organization
 **/
export function update(organization) {
  return Organization.findById(organization.id)
    .then((p) => {
      return p.update(organization);
    });
};

/**
 * Delete organization(s) based on input criteria
 * @param organization object literal containing info about a organization
 **/
export function deleteOrganization(organization) {
  return Organization.destroy({
    where: {
      ...organization
    }
  });
};
