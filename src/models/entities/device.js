import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Device = sequelize.define(
        'tbdevices',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            createdat: {
                type: DataTypes.DATE,
                defaultValue: sequelize.fn('NOW'),
                field: 'createdat',
            },
            lastseen: {
                type: DataTypes.DATE,
                defaultValue: sequelize.fn('NOW'),
                field: 'lastseen',
            },
        },
        {
            timestamps: false,
            tableName: 'tbdevices',
        },
    );

    return Device;
};
