import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const User = sequelize.define(
        'tbusers',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            username: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            refreshtoken: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'refreshtoken',
            },
            createdat: {
                type: DataTypes.DATE,
                defaultValue: sequelize.fn('NOW'),
                field: 'createdat',
            },
        },
        {
            timestamps: false,
            tableName: 'tbusers',
        },
    );

    return User;
};
