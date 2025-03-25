import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const MedicationHistory = sequelize.define(
        'tbmedicationshistory',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            medicationid: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'tbmedications',
                    key: 'id',
                },
                field: 'medicationid',
            },
            takendate: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.fn('NOW'),
                field: 'takendate',
            },
            taken: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                field: 'taken',
            },
        },
        {
            timestamps: false,
            tableName: 'tbmedicationshistory',
        },
    );

    return MedicationHistory;
};
