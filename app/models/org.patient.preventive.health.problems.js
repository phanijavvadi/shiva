"use strict";
import  constants from '../util/constants/constants';

export default function (sequelize, DataTypes) {

  const PreventativeHealthProblems = sequelize.define("PreventativeHealthProblems", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    }
  }, {
    paranoid: false,
    freezeTableName: true,
    tableName: constants.getTableName('org_patient_preventative_health_problems'),
    indexes: [
      {
        unique: true,
        fields: ['careProblemId', 'carePlanId']
      }
    ]
  });
  PreventativeHealthProblems.associate = function (models) {
    PreventativeHealthProblems.belongsTo(models.CareProblems, {
      foreignKey: {
        name: 'careProblemId',
        allowNull: true
      },
      as: 'careProblem'
    });

    PreventativeHealthProblems.belongsTo(models.User, {
      foreignKey: {
        name: 'createdBy',
        allowNull: true
      }
    });
  };
  return PreventativeHealthProblems;
};