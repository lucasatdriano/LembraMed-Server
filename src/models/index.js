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
        foreignKey: 'userId',
        as: 'medications',
    });
    models.User.hasMany(models.Contact, {
        foreignKey: 'userId',
        as: 'contacts',
    });
};

models.Contact.associate = (models) => {
    models.Contact.belongsTo(models.User, { foreignKey: 'userId' });
};

models.DoseIntervals.associate = (models) => {
    models.DoseIntervals.hasMany(models.Medication, {
        foreignKey: 'doseIntervalId',
        as: 'medications',
    });
};

models.Medication.associate = (models) => {
    models.Medication.belongsTo(models.User, { foreignKey: 'userId' });
    models.Medication.belongsTo(models.DoseIntervals, {
        foreignKey: 'doseIntervalId',
        as: 'doseInterval',
    });
};

Object.values(models).forEach((model) => {
    if (model.associate) {
        console.log(`Definindo associações para o modelo ${model.name}`);
        model.associate(models);
    }
});

export { sequelize, models };
