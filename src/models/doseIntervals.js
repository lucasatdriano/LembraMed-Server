import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const DoseIntervals = sequelize.define(
        'tbDoseIntervals',
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

    return DoseIntervals;
};
