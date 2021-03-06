"use strict";
import commonUtil from "../util/common.util";
import constants from "../util/constants/constants";

export default function (sequelize, DataTypes) {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    phoneNo: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: DataTypes.STRING,
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
      allowNull: false,
      comment: "1=>Active,2=>In Active"
    }
  }, {
    paranoid: true,
    freezeTableName: true,
    tableName: constants.getTableName('users')
  });
  User.associate = function (models) {
    User.belongsTo(models.UserCategory, {
      foreignKey: {
        name: 'userCategoryId',
        allowNull: false
      },
      as: 'userCategory'
    });
    User.hasMany(models.UserRole, {
      foreignKey: {
        name: 'userId',
        allowNull: false
      },
      as: 'userRoles'
    });

    User.belongsTo(models.User, {
      foreignKey: {
        name: 'createdBy',
        allowNull: true
      },
      as: 'createdUser'
    });
  }

  User.beforeCreate((user, options) => {
    if (user.password) {
      user.password = commonUtil.getHash(user.password);
    }
  });
  User.beforeUpdate((user, options) => {
    if (user.password) {
      user.password = commonUtil.getHash(user.password);
    }
  });
  return User;
};
