'use strict';
/**
 * Module dependencies.
 */
import express from 'express';
import patientCarePlanCtrl from '../controllers/patient.care.plan.ctrl';
import patientCarePlanValidator from '../validators/patient.care.plan.validator';
import cors from 'cors';

const router = express.Router();
const patientRouter = express.Router();

export default function (app) {


  router.route('/:patientId')
    .get([
      patientCarePlanCtrl.get]);
  router.route('/metric/:metric_id/act-plan-inputs')
    .get([
      patientCarePlanCtrl.getActionPlanInputs]);

  router.route('/metric/save-target')
    .post([
      patientCarePlanValidator.saveMetricTargetReqValidator,
      patientCarePlanCtrl.saveMetricTarget]);

  router.route('/metric/save-metric')
    .post([
      patientCarePlanValidator.saveMetricReqValidator,
      patientCarePlanCtrl.saveMetric]);
  router.route('/action-plan/save-input')
    .post([
      patientCarePlanValidator.saveActionPlanInputReqValidator,
      patientCarePlanCtrl.saveActionPlanInput]);

  patientRouter.route('/:patientId')
    .get([
      patientCarePlanCtrl.get]);
  patientRouter.route('/metric/:metric_id/act-plan-inputs')
    .get([
      patientCarePlanCtrl.getActionPlanInputs]);


  router.route('/create')
    .post([
      patientCarePlanValidator.createReqValidator,
      patientCarePlanCtrl.create]);

  router.route('/clone')
    .post([
      patientCarePlanValidator.cloneReqValidator,
      patientCarePlanCtrl.cloneCarePlan]);
  router.route('/download')
    .post([
      patientCarePlanValidator.downloadCarePlanReqValidator,
      patientCarePlanCtrl.downloadCarePlan]);

  router.route('/publish')
    .post([
      patientCarePlanValidator.publishReqValidator,
      patientCarePlanCtrl.publish]);

  router.route('/add-problem')
    .post([
      patientCarePlanValidator.addCarePlanProblemReqValidator,
      patientCarePlanCtrl.addProblem]);

  router.route('/remove-problem')
    .post([
      patientCarePlanValidator.removeCarePlanProblemReqValidator,
      patientCarePlanCtrl.removeProblem]);

  router.route('/add-problem-metric')
    .post([
      patientCarePlanValidator.addProblemMetricReqValidator,
      (req, resp, next) => {
        const cp_prob_id = req.body.cp_prob_id;
        patientCarePlanValidator.isValidCarePlanProblemId(cp_prob_id, req, resp, next)
      },
      patientCarePlanCtrl.addProblemMetric]);
  router.route('/remove-problem-metric')
    .delete([
      patientCarePlanValidator.removeProblemMetricReqValidator,
      (req, resp, next) => {
        const cp_prob_id = req.body.cp_prob_id;
        patientCarePlanValidator.isValidCarePlanProblemId(cp_prob_id, req, resp, next)
      },
      patientCarePlanCtrl.removeProblemMetric]);

  app.use('/api/org-user/private/care-plan', router);
  app.use('/api/patient/private/care-plan', patientRouter);
}
