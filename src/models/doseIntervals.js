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
            intervalinhours: {
                type: DataTypes.SMALLINT,
                unique: true,
                allowNull: false,
                validate: {
                    min: 1,
                },
                field: 'intervalinhours',
            },
            createdat: {
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
