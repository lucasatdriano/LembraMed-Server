import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default (sequelize) => {
    const User = sequelize.define(
        'tbUsers',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: uuidv4,
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
            refreshToken: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: sequelize.fn('NOW'),
            },
        },
        {
            timestamps: false,
        },
    );

    return User;
};
