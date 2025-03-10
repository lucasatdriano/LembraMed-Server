import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default (sequelize) => {
    const Medication = sequelize.define(
        'tbMedications',
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
            hourFirstDose: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            periodStart: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            periodEnd: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            doseIntervalId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tbDoseIntervals',
                    key: 'id',
                },
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

    return Medication;
};
