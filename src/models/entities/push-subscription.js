import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const PushSubscription = sequelize.define(
        'tbpushsubscriptions',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            userid: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            deviceid: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            endpoint: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            p256dh: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            auth: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            createdat: {
                type: DataTypes.DATE,
                defaultValue: sequelize.fn('NOW'),
                field: 'createdat',
            },
            lastused: {
                type: DataTypes.DATE,
                defaultValue: sequelize.fn('NOW'),
                field: 'lastused',
            },
        },
        {
            timestamps: false,
            tableName: 'tbpushsubscriptions',
        },
    );

    return PushSubscription;
};
