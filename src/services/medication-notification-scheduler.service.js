import { models } from '../models/index.js';
import { Op } from 'sequelize';
import { timezone } from '../utils/formatters/timezone.js';
import { NotificationService } from './notification.service.js';
import { calcularTolerancia } from '../utils/helpers/dose-rules.helper.js';

class MedicationNotificationScheduler {
    constructor() {
        this.initialTracker = new Set();
        this.reminderTracker = new Map();
        this.missedTracker = new Set();
    }

    async checkMedicationNotifications() {
        try {
            console.log('\n💊 [NOTIFICATIONS] ========== INÍCIO ==========');
            const agora = timezone.now();

            const medicamentos = await models.Medication.findAll({
                where: {
                    pendingconfirmation: false,
                },
                include: [
                    {
                        model: models.DoseIntervals,
                        as: 'doseinterval',
                        attributes: ['intervalinhours'],
                    },
                ],
            });

            console.log(`Total a verificar: ${medicamentos.length}`);

            for (const med of medicamentos) {
                await this.processMedication(med, agora);
            }
        } catch (error) {
            console.error('[NOTIFICATIONS] ERRO:', error);
        }
    }

    async processMedication(medication, agora) {
        try {
            const [horas, minutos] = medication.hournextdose
                .split(':')
                .map(Number);

            const horarioDoseHoje = new Date(agora);
            horarioDoseHoje.setHours(horas, minutos, 0, 0);

            const toleranciaMinutos = calcularTolerancia(
                medication.doseinterval.intervalinhours,
            );

            const diffMinutos =
                (agora.getTime() - horarioDoseHoje.getTime()) / (60 * 1000);

            console.log(`\n📊 ${medication.name}:`);
            console.log(`   - hournextdose: ${medication.hournextdose}`);
            console.log(`   - diff: ${Math.round(diffMinutos)}min`);
            console.log(`   - tolerância: ${toleranciaMinutos}min`);

            if (Math.abs(diffMinutos) < 1) {
                const initialKey = `${medication.userid}-${medication.id}-${horarioDoseHoje.toISOString()}`;

                if (!this.initialTracker.has(initialKey)) {
                    await NotificationService.sendMedicationReminder(
                        medication.userid,
                        medication.id,
                        medication.name,
                        medication.hournextdose,
                        'initial',
                    );
                    this.initialTracker.add(initialKey);
                }
                return;
            }

            // CASO 2: DENTRO DA TOLERÂNCIA
            if (diffMinutos > 0 && diffMinutos <= toleranciaMinutos) {
                const reminderKey = `${medication.userid}-${medication.id}`;
                const lastReminder = this.reminderTracker.get(reminderKey);

                const deveEnviar =
                    !lastReminder ||
                    agora.getTime() - lastReminder >= 5 * 60 * 1000; //5m

                if (deveEnviar) {
                    console.log(`   🟡 Enviando REMINDER`);
                    await NotificationService.sendMedicationReminder(
                        medication.userid,
                        medication.id,
                        medication.name,
                        medication.hournextdose,
                        'reminder',
                    );
                    this.reminderTracker.set(reminderKey, agora.getTime());
                }
                return;
            }

            // CASO 3: PASSOU DA TOLERÂNCIA
            if (diffMinutos > toleranciaMinutos) {
                const missedKey = `${medication.userid}-${medication.id}-${horarioDoseHoje.toISOString()}`;

                if (!this.missedTracker.has(missedKey)) {
                    console.log(`   🔴 Enviando MISSED`);
                    await NotificationService.sendMedicationReminder(
                        medication.userid,
                        medication.id,
                        medication.name,
                        medication.hournextdose,
                        'missed',
                    );
                    this.missedTracker.add(missedKey);
                }
                return;
            }

            console.log(`Aguardando horário`);
        } catch (error) {
            console.error(`Erro ${medication.name}:`, error);
        }
    }

    /**
     * Verifica medicamentos com período expirado e envia notificação
     */
    async checkExpiredMedications(agora) {
        try {
            console.log(`[CheckExpired] Verificando medicamentos expirados...`);

            const inicioDoDiaAtual = new Date(agora);
            inicioDoDiaAtual.setHours(0, 0, 0, 0);

            const medicamentosExpirados = await models.Medication.findAll({
                where: {
                    periodend: {
                        [Op.ne]: null,
                        [Op.lt]: inicioDoDiaAtual,
                    },
                },
                attributes: [
                    'id',
                    'name',
                    'periodend',
                    'userid',
                    'hournextdose',
                ],
            });

            if (medicamentosExpirados.length === 0) {
                console.log(`✅ Nenhum medicamento expirado encontrado.`);
                return;
            }

            for (const med of medicamentosExpirados) {
                console.log(`Deletando medicamento expirado: ${med.name}`);

                const title = 'Medicamento Expirado';
                const message = `O período de uso de ${med.name} terminou. O medicamento foi removido da sua lista.`;

                await NotificationService.sendNotification(
                    med.userid,
                    title,
                    message,
                    `med-expired-${med.id}`,
                );

                // Também podemos usar o sendMedicationReminder se preferir
                // await NotificationService.sendMedicationReminder(
                //     med.userid,
                //     med.id,
                //     med.name,
                //     med.hournextdose || '00:00',
                //     'expired'
                // );

                const trackerKey = `${med.userid}-${med.id}`;
                this.notificationTracker.delete(trackerKey);

                await med.destroy();

                console.log(
                    `✅ Medicamento ${med.name} deletado e notificação enviada`,
                );
            }
        } catch (error) {
            console.error('Erro ao verificar medicamentos expirados:', error);
        }
    }

    cleanup() {
        const umDiaAtras = Date.now() - 24 * 60 * 60 * 1000;

        for (const [key, timestamp] of this.reminderTracker.entries()) {
            if (timestamp < umDiaAtras) {
                this.reminderTracker.delete(key);
            }
        }

        console.log('🧹 Trackers limpos');
    }
}

export default new MedicationNotificationScheduler();
