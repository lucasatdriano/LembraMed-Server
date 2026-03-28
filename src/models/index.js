import sequelize from '../config/db.js';
import { logger } from '../utils/logger.js';

import initUser from './entities/user.js';
import initDevice from './entities/device.js';
import initAccountDevice from './entities/account-device.js';
import initRefreshToken from './entities/refresh-token.js';
import initPushSubscription from './entities/push-subscription.js';
import initNotification from './entities/notification.js';
import initContact from './entities/contact.js';
import initMedication from './entities/medication.js';
import initDoseIntervals from './entities/dose-intervals.js';
import initMedicationHistory from './entities/medication-history.js';

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

models.User.hasMany(models.Medication, {
    foreignKey: 'userid',
    as: 'medications',
});

models.User.hasMany(models.Contact, {
    foreignKey: 'userid',
    as: 'contacts',
});

models.Device.hasMany(models.AccountDevice, {
    foreignKey: 'deviceid',
    as: 'accounts',
});

models.Device.hasMany(models.PushSubscription, {
    foreignKey: 'deviceid',
    as: 'subscriptions',
});

models.AccountDevice.belongsTo(models.User, {
    foreignKey: 'userid',
    as: 'user',
});

models.AccountDevice.belongsTo(models.Device, {
    foreignKey: 'deviceid',
    as: 'device',
});

models.RefreshToken.belongsTo(models.User, {
    foreignKey: 'userid',
    as: 'user',
});

models.RefreshToken.belongsTo(models.Device, {
    foreignKey: 'deviceid',
    as: 'device',
});

models.PushSubscription.belongsTo(models.User, {
    foreignKey: 'userid',
    as: 'user',
});

models.PushSubscription.belongsTo(models.Device, {
    foreignKey: 'deviceid',
    as: 'device',
});

models.Notification.belongsTo(models.User, {
    foreignKey: 'userid',
    as: 'user',
});

models.Contact.belongsTo(models.User, {
    foreignKey: 'userid',
});

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

models.DoseIntervals.hasMany(models.Medication, {
    foreignKey: 'doseintervalid',
    as: 'medications',
});

models.MedicationHistory.belongsTo(models.Medication, {
    foreignKey: 'medicationid',
    as: 'medication',
});

logger.debug('Database models initialized');

export { models };
