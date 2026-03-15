import { models } from '../models/index.js';

export class DeviceRepository {
    static async findOrCreateDevice(deviceId, deviceName) {
        return models.Device.findOrCreate({
            where: { id: deviceId },
            defaults: {
                name: deviceName,
            },
        });
    }

    static async updateLastSeen(deviceId, date) {
        await models.Device.update(
            { lastseen: date },
            { where: { id: deviceId } },
        );
    }

    static async deleteDevice(deviceId) {
        return models.Device.destroy({
            where: { id: deviceId },
        });
    }
}
