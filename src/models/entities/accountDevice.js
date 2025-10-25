import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const AccountDevice = sequelize.define(
        'tbaccountdevices',
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
            accesstoken: {
                type: DataTypes.TEXT,
                allowNull: true,
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
            tableName: 'tbaccountdevices',
        },
    );

    return AccountDevice;
};
