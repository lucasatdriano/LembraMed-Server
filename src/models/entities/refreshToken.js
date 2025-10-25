import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const RefreshToken = sequelize.define(
        'tbrefreshtokens',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            token: {
                type: DataTypes.TEXT,
                allowNull: false,
                unique: true,
            },
            userid: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            deviceid: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            revoked: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            expiresat: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'expiresat',
            },
            createdat: {
                type: DataTypes.DATE,
                defaultValue: sequelize.fn('NOW'),
                field: 'createdat',
            },
        },
        {
            timestamps: false,
            tableName: 'tbrefreshtokens',
            indexes: [
                {
                    fields: ['userid', 'deviceid'],
                },
                {
                    fields: ['expiresat'],
                },
                {
                    fields: ['token'],
                },
            ],
        },
    );

    return RefreshToken;
};
