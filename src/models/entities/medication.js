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
            hourfirstdose: {
                type: DataTypes.TIME,
                allowNull: false,
                field: 'hourfirstdose',
            },
            hournextdose: {
                type: DataTypes.TIME,
                allowNull: false,
                field: 'hournextdose',
            },
            periodstart: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'periodstart',
            },
            periodend: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'periodend',
            },
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'status',
            },
            pendingconfirmation: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'pendingconfirmation',
            },
            pendinguntil: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'pendinguntil',
            },
            doseintervalid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tbdoseintervals',
                    key: 'id',
                },
                field: 'doseintervalid',
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
            tableName: 'tbmedications',
        },
    );

    return Medication;
};
