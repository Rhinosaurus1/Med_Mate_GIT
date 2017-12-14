module.exports = function(sequelize, DataTypes){


  var Meds = sequelize.define("Meds", {

    med_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        len: [1]
      }
    },
    med_dose: {
      type: DataTypes.STRING,
      allowNull: false
    },
    freq_main: {
      type: DataTypes.STRING,
      allowNull: false
    },
    freq_times: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATE
    },
    instructions: {
      type: DataTypes.STRING
    },
    initial_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    remaining_count: {
      type: DataTypes.INTEGER,
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

  Meds.associate = function(models) {

    Meds.belongsTo(models.User, {
      foreignKey: {
        allowNull: false
      },
      onDelete: "cascade"
    });
  };

return Meds;
};