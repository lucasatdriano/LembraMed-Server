import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Session = sequelize.define(
        'tbsessions',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            userid: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'tbusers',
                    key: 'id',
                },
                field: 'userid',
            },
            accesstoken: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'accesstoken',
            },
            refreshtoken: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'refreshtoken',
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'active',
            },
            deviceinfo: {
                type: DataTypes.STRING,
                field: 'deviceinfo',
            },
        },
        {
            tableName: 'tbsessions',
        },
    );
};
