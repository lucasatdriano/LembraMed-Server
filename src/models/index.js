import sequelize from '../config/db.js';
import initUser from './entities/user.js';
import initSession from './entities/session.js';
import initContact from './entities/contact.js';
import initMedication from './entities/medication.js';
import initDoseIntervals from './entities/doseIntervals.js';
import initMedicationHistory from './entities/medicationHistory.js';

const models = {
    User: initUser(sequelize),
    Session: initSession(sequelize),
    Contact: initContact(sequelize),
    Medication: initMedication(sequelize),
    DoseIntervals: initDoseIntervals(sequelize),
    MedicationHistory: initMedicationHistory(sequelize),
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
    models.User.hasMany(models.Session, {
        foreignKey: 'userid',
        as: 'sessions',
    });
};

models.Session.associate = (models) => {
    models.Session.belongsTo(models.User, {
        foreignKey: 'userid',
    });
};

models.Contact.associate = (models) => {
    models.Contact.belongsTo(models.User, {
        foreignKey: 'userid',
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
    models.Medication.hasMany(models.MedicationHistory, {
        foreignKey: 'medicationid',
        as: 'history',
    });
};

models.DoseIntervals.associate = (models) => {
    models.DoseIntervals.hasMany(models.Medication, {
        foreignKey: 'doseintervalid',
        as: 'medications',
    });
};

models.MedicationHistory.associate = (models) => {
    models.MedicationHistory.belongsTo(models.Medication, {
        foreignKey: 'medicationid',
        as: 'medication',
    });
};

Object.values(models).forEach((model) => {
    if (model.associate) {
        console.log(`Definindo associações para o modelo ${model.name}`);
        model.associate(models);
    }
});

export { sequelize, models };
