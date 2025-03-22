import sequelize from '../config/db.js';
import initContact from './contact.js';
import initDoseIntervals from './doseIntervals.js';
import initMedication from './medication.js';
import initUser from './user.js';

const models = {
    User: initUser(sequelize),
    Contact: initContact(sequelize),
    DoseIntervals: initDoseIntervals(sequelize),
    Medication: initMedication(sequelize),
};

models.User.associate = (models) => {
    models.User.hasMany(models.Medication, {
        foreignKey: 'userid',
        as: 'medications',
    });
    models.User.hasMany(models.Contact, {
        foreignKey: 'userid',
        as: 'contacts',
    });
};

models.Contact.associate = (models) => {
    models.Contact.belongsTo(models.User, {
        foreignKey: 'userid',
    });
};

models.DoseIntervals.associate = (models) => {
    models.DoseIntervals.hasMany(models.Medication, {
        foreignKey: 'doseintervalid',
        as: 'medications',
    });
};

models.Medication.associate = (models) => {
    models.Medication.belongsTo(models.User, {
        foreignKey: 'userid',
    });
    models.Medication.belongsTo(models.DoseIntervals, {
        foreignKey: 'doseintervalid',
        as: 'doseinterval',
    });
};

Object.values(models).forEach((model) => {
    if (model.associate) {
        console.log(`Definindo associações para o modelo ${model.name}`);
        model.associate(models);
    }
});

export { sequelize, models };
