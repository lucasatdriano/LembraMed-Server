import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default (sequelize) => {
    const Contact = sequelize.define(
        'tbContacts',
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
            numberPhone: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'tbUsers',
                    key: 'id',
                },
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

    return Contact;
};
