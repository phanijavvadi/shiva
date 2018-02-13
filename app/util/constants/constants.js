'use strict';

export default {
  contexts: {
    PATIENT: 'PATIENT',
  },
  userCategoryTypes: {
    CM_USER: 'CM_USER',
    ORG_USER: 'ORG_USER',
  },
  userSubCategory: {
    CM_ADMIN_USERS: 'CM_ADMIN_USERS',
    ORG_ADMIN_USERS: 'ORG_ADMIN_USERS',
    ORG_PRACTITIONERS: 'ORG_PRACTITIONERS',
  },
  userTypes: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ORG_ADMIN: 'ORG_ADMIN',
    ABORIGINAL_AND_TORRES_STRAIT_ISLANDER_HEALTH_PRACTITIONER: 'ABORIGINAL_AND_TORRES_STRAIT_ISLANDER_HEALTH_PRACTITIONER',
    CHINESE_MEDICINE_PRACTITIONER: 'CHINESE_MEDICINE_PRACTITIONER',
    CHIROPRACTOR: 'CHIROPRACTOR',
  },
  errorCodes: {
    INVALID_ORG_USER_TYPE: 'INVALID_ORG_USER_TYPE',
  },
  getTableName: function(tableKey){
    return this.tables.prefix + this.tables[tableKey];
  },
  tables: {
    prefix: 'cm_',
    attachments: 'attachments',
    care_problems: 'care_problems',
    org_health_problems_master: 'org_health_problems_master',
    org_api_keys: 'org_api_keys',
    org_contact_details: 'org_contact_details',
    org_imported_data: 'org_imported_data',
    org_patient_care_plan: 'org_patient_care_plan',
    org_patient_care_plan_problems: 'org_patient_care_plan_problems',
    org_patient_family_history: 'org_patient_family_history',
    org_patient_health_insurance: 'org_patient_health_insurance',
    org_patients: 'org_patients',
    org_patient_medical_history: 'org_patient_medical_history',
    org_patient_medications: 'org_patient_medications',
    org_patient_preventative_health: 'org_patient_preventative_health',
    org_patient_preventative_health_problems: 'org_patient_preventative_health_problems',
    org_patients_social_history: 'org_patients_social_history',
    org_subscriptions: 'org_subscriptions',
    org_subscription_types: 'org_subscription_types',
    organisations: 'organisations',
    user_categories: 'user_categories',
    users: 'users',
    user_roles: 'user_roles',
    user_sub_categories: 'user_sub_categories',
    user_types: 'user_types',
    user_verifications: 'user_verifications',
  }
};