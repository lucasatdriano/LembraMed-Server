import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Contact = sequelize.define(
        'tbcontacts',
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
            numberphone: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'numberphone',
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
            createdat: {
                type: DataTypes.DATE,
                defaultValue: sequelize.fn('NOW'),
                field: 'createdat',
            },
        },
        {
            timestamps: false,
            tableName: 'tbcontacts',
        },
    );

    return Contact;
};
