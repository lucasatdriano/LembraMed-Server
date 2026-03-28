import { logger } from '../logger.js';

export const calculateDoseTolerance = (intervalInHours) => {
    const intervalInMinutes = intervalInHours * 60;
    const toleranceInMinutes = Math.floor(intervalInMinutes * 0.25);

    logger.debug(
        { intervalInHours, toleranceInMinutes },
        'Dose tolerance calculated',
    );

    return toleranceInMinutes;
};
