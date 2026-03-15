import { models } from '../models/index.js';

export class AccountDeviceRepository {
    static async findAccountsByDevice(deviceId) {
        return models.AccountDevice.findAll({
            where: { deviceid: deviceId },
            include: [
                {
                    model: models.User,
                    attributes: ['id', 'name', 'username'],
                    as: 'user',
                },
            ],
            order: [['lastused', 'DESC']],
        });
    }
    static async updateAccessToken(userId, deviceId, accessToken, date) {
        return models.AccountDevice.update(
            {
                accesstoken: accessToken,
                lastused: date,
            },
            {
                where: {
                    userid: userId,
                    deviceid: deviceId,
                },
            },
        );
    }

    static async findAccount(userId, deviceId) {
        return models.AccountDevice.findOne({
            where: {
                userid: userId,
                deviceid: deviceId,
            },
        });
    }

    static async findByToken(userId, deviceId, token) {
        return models.AccountDevice.findOne({
            where: {
                userid: userId,
                deviceid: deviceId,
                accesstoken: token,
            },
        });
    }

    static async findOrCreate(userId, deviceId, accessToken) {
        return models.AccountDevice.findOrCreate({
            where: {
                userid: userId,
                deviceid: deviceId,
            },
            defaults: {
                accesstoken: accessToken,
            },
        });
    }

    static async deleteAccount(userId, deviceId) {
        return models.AccountDevice.destroy({
            where: { userid: userId, deviceid: deviceId },
        });
    }
}
