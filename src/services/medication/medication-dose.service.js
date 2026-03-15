import { MedicationRepository } from '../../repositories/medication.repository.js';
import { timezone } from '../../utils/formatters/timezone.js';
import {
    calcularTolerancia,
    verificarIntervaloMinimo,
} from '../../utils/helpers/dose-rules.helper.js';
import { AppError } from '../../utils/errors/app.error.js';
import { logger } from '../../utils/logger.js';

export class MedicationDoseService {
    static async registerPendingConfirmation(userId, medicationId) {
        logger.info({ medicationId, userId }, 'REGISTER_PENDING start');

        const agora = timezone.now();

        const medication = await MedicationRepository.findOne({
            where: { id: medicationId, userid: userId },
            include: [{ association: 'doseinterval' }],
        });

        if (!medication) {
            throw new AppError('Medicamento não encontrado', 404);
        }

        const intervaloHoras = medication.doseinterval.intervalinhoras;

        const doseAtual = this.determinarDoseAtual(medication, agora);

        const toleranciaMinutos = calcularTolerancia(intervaloHoras);
        logger.debug(
            { medicationId, intervaloHoras, toleranciaMinutos },
            'Tolerance minutes calculated',
        );

        const diffMinutos = (agora - doseAtual) / (60 * 1000);

        if (diffMinutos > toleranciaMinutos) {
            throw new AppError('Esta dose já está perdida', 400);
        }

        const validacaoIntervalo = verificarIntervaloMinimo(medication, agora);

        if (!validacaoIntervalo.valido) {
            throw new AppError(validacaoIntervalo.mensagem, 400);
        }

        const pendingUntilTimestamp = agora.getTime() + 3 * 60 * 1000;
        const pendingUntilDate = new Date(pendingUntilTimestamp);

        logger.debug(
            {
                medicationId,
                pendingUntil: pendingUntilTimestamp,
                pendingUntilFormatted: pendingUntilDate.toLocaleString(
                    'pt-BR',
                    {
                        timeZone: 'America/Sao_Paulo',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    },
                ),
            },
            'Pending until timestamp calculated',
        );

        await MedicationRepository.update(medication, {
            status: true,
            pendingconfirmation: true,
            pendinguntil: pendingUntilTimestamp,
        });
        logger.info(
            { medicationId, pendingUntil: pendingUntilTimestamp },
            'Medication updated successfully',
        );

        const dataExpiracao = pendingUntilDate.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const response = {
            message: `Dose registrada. Aguardando confirmação até ${dataExpiracao}.`,
            pendingUntil: pendingUntilTimestamp,
            pendingUntilFormatted: dataExpiracao,
            expiresIn: '3 minutos',
        };

        logger.info({ medicationId, response }, 'REGISTER_PENDING success');
        return response;
    }

    static async cancelPendingDose(userId, medicationId) {
        const medication = await MedicationRepository.findOne({
            where: { id: medicationId, userid: userId },
        });

        if (!medication) {
            throw new AppError('Medicamento não encontrado', 404);
        }

        await MedicationRepository.update(medication, {
            status: false,
            pendingconfirmation: false,
            pendinguntil: null,
        });

        return { message: 'Confirmação cancelada' };
    }

    static determinarDoseAtual(medication, agora) {
        const [horas, minutos] = medication.hournextdose.split(':').map(Number);

        const isNewMedication =
            !medication.lastdosetime || medication.status === false;

        if (isNewMedication) {
            const primeiraDose = new Date(agora);
            primeiraDose.setHours(horas, minutos, 0, 0);

            return primeiraDose;
        }

        const doseHoje = new Date(agora);
        doseHoje.setHours(horas, minutos, 0, 0);

        const doseOntem = new Date(agora);
        doseOntem.setDate(doseOntem.getDate() - 1);
        doseOntem.setHours(horas, minutos, 0, 0);

        return agora < doseHoje ? doseOntem : doseHoje;
    }
}
