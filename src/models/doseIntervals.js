import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const DoseIntervals = sequelize.define(
        'tbdoseintervals',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            intervalInHours: {
                type: DataTypes.SMALLINT,
                unique: true,
                allowNull: false,
                validate: {
                    min: 1,
                },
                field: 'intervalinhours',
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: sequelize.fn('NOW'),
                field: 'createdat',
            },
        },
        {
            timestamps: false,
            tableName: 'tbdoseintervals',
        },
    );

    return DoseIntervals;
};
