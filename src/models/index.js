import sequelize from '../config/db.js';
import initUser from './entities/user.js';
import initDevice from './entities/device.js';
import initAccountDevice from './entities/accountDevice.js';
import initRefreshToken from './entities/refreshToken.js';
import initPushSubscription from './entities/pushSubscription.js';
import initNotification from './entities/notification.js';
import initContact from './entities/contact.js';
import initMedication from './entities/medication.js';
import initDoseIntervals from './entities/doseIntervals.js';
import initMedicationHistory from './entities/medicationHistory.js';

const models = {
    User: initUser(sequelize),
    Device: initDevice(sequelize),
    AccountDevice: initAccountDevice(sequelize),
    RefreshToken: initRefreshToken(sequelize),
    PushSubscription: initPushSubscription(sequelize),
    Notification: initNotification(sequelize),
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
};

models.Device.associate = (models) => {
    models.Device.hasMany(models.AccountDevice, {
        foreignKey: 'deviceid',
        as: 'accounts',
    });
    models.Device.hasMany(models.PushSubscription, {
        foreignKey: 'deviceid',
        as: 'subscriptions',
    });
};

models.AccountDevice.associate = (models) => {
    models.AccountDevice.belongsTo(models.User, {
        foreignKey: 'userid',
        as: 'user',
    });
    models.AccountDevice.belongsTo(models.Device, {
        foreignKey: 'deviceid',
        as: 'device',
    });
};

models.RefreshToken.associate = (models) => {
    models.RefreshToken.belongsTo(models.User, {
        foreignKey: 'userid',
        as: 'user',
    });
    models.RefreshToken.belongsTo(models.Device, {
        foreignKey: 'deviceid',
        as: 'device',
    });
};

models.PushSubscription.associate = (models) => {
    models.PushSubscription.belongsTo(models.User, {
        foreignKey: 'userid',
        as: 'user',
    });
    models.PushSubscription.belongsTo(models.Device, {
        foreignKey: 'deviceid',
        as: 'device',
    });
};

models.Notification.associate = (models) => {
    models.Notification.belongsTo(models.User, {
        foreignKey: 'userid',
        as: 'user',
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
