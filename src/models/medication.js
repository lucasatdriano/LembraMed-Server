import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Medication = sequelize.define(
        'tbmedications',
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
            hourFirstDose: {
                type: DataTypes.TIME,
                allowNull: false,
                field: 'hourfirstdose',
            },
            hourNextDose: {
                type: DataTypes.TIME,
                allowNull: false,
                field: 'hournextdose',
            },
            periodStart: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'periodstart',
            },
            periodEnd: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'periodend',
            },
            doseIntervalId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tbdoseintervals',
                    key: 'id',
                },
                field: 'doseintervalid',
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'tbusers',
                    key: 'id',
                },
                field: 'userid',
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: sequelize.fn('NOW'),
                field: 'createdat',
            },
        },
        {
            timestamps: false,
            tableName: 'tbmedications',
        },
    );

    return Medication;
};
