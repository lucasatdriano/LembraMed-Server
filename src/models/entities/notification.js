import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Notification = sequelize.define(
        'tbnotifications',
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
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            sentat: {
                type: DataTypes.DATE,
                defaultValue: sequelize.fn('NOW'),
                field: 'sentat',
            },
            readat: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'readat',
            },
        },
        {
            timestamps: false,
            tableName: 'tbnotifications',
        },
    );

    return Notification;
};
