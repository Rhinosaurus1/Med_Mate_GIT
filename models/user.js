module.exports = function(sequelize, DataTypes){

  var User = sequelize.define("User", {

    user_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        len: [1]
      }
    },
    login_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email_address: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    active_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    timestamps: false
  });


return User;
};