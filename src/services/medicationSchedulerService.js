import cron from 'node-cron';
import { models } from '../models/index.js';
import { Op } from 'sequelize';
import { calcularTolerancia } from '../utils/helpers/doseRules.js';
import { timezone } from '../utils/formatters/timezone.js';

class MedicationScheduler {
    constructor() {
        this.initialized = false;
        this.timeZone = 'America/Sao_Paulo';
        this.executionCount = 0;
    }

    init() {
        if (this.initialized) return;

        console.log('\n⏰ ========== INICIANDO SCHEDULER ==========');
        console.log(`⏰ Fuso horário configurado: ${this.timeZone}`);

        // RODA A CADA 1 MINUTO
        cron.schedule('* * * * *', () => {
            this.executionCount++;
            const agora = timezone.now();

            console.log(
                `\n⏰ [CRON #${this.executionCount}] DISPAROU! ${agora.toISOString()}`,
            );
            console.log(
                `⏰ [CRON] Hora local: ${agora.getHours()}:${agora.getMinutes()}:${agora.getSeconds()}`,
            );
            this.checkMedications();
        });

        this.initialized = true;
        console.log(`⏰ ========== SCHEDULER INICIALIZADO ==========\n`);
    }

    async checkMedications() {
        try {
            console.log(
                `\n🔍 [SCHEDULER #${this.executionCount}] VERIFICANDO MEDICAMENTOS...`,
            );

            const agora = timezone.now();
            console.log(
                `🔍 [SCHEDULER] Data/hora atual: ${agora.toISOString()}`,
            );

            console.log(`\n🔍 [SCHEDULER] BUSCANDO DOSES PARA CONFIRMAR...`);

            const dosesParaConfirmar = await models.Medication.findAll({
                where: {
                    status: true,
                    pendingconfirmation: true,
                    pendinguntil: {
                        [Op.lte]: agora,
                    },
                },
                include: [
                    {
                        model: models.DoseIntervals,
                        as: 'doseinterval',
                        attributes: ['intervalinhours'],
                    },
                ],
            });

            console.log(
                `🔍 [SCHEDULER] Encontradas ${dosesParaConfirmar.length} doses para confirmar`,
            );

            for (const med of dosesParaConfirmar) {
                await this.confirmDose(med);
            }

            console.log(`\n🔍 [SCHEDULER] BUSCANDO DOSES PERDIDAS...`);

            const todosMedicamentos = await models.Medication.findAll({
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

            for (const med of todosMedicamentos) {
                await this.checkMissedDose(med, agora);
            }

            console.log(
                `\n✅ [SCHEDULER #${this.executionCount}] VERIFICAÇÃO CONCLUÍDA\n`,
            );
        } catch (error) {
            console.error('❌ [SCHEDULER] ERRO:', error);
        }
    }

    async confirmDose(medication) {
        try {
            console.log(
                `\n✅ [CONFIRM_DOSE] ========== CONFIRMANDO DOSE ==========`,
            );
            console.log(
                `✅ [CONFIRM_DOSE] Medicamento: ${medication.name} (ID: ${medication.id})`,
            );
            console.log(
                `✅ [CONFIRM_DOSE] Horário programado: ${medication.hournextdose}`,
            );
            console.log(
                `✅ [CONFIRM_DOSE] PendingUntil: ${medication.pendinguntil}`,
            );

            const agora = timezone.now();

            const history = await models.MedicationHistory.create({
                medicationid: medication.id,
                takendate: agora,
                taken: true,
            });
            console.log(`✅ [CONFIRM_DOSE] Histórico criado ID: ${history.id}`);

            const horaTomada = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;

            const proximoHorario = this.calcularProximoHorario(
                medication.hournextdose,
                medication.doseinterval.intervalinhours,
            );
            console.log(
                `✅ [CONFIRM_DOSE] Próximo horário calculado: ${proximoHorario}`,
            );

            await medication.update({
                status: false,
                pendingconfirmation: false,
                pendinguntil: null,
                lasttakentime: horaTomada,
                hournextdose: proximoHorario,
            });

            console.log(`✅ [CONFIRM_DOSE] Medicamento ATUALIZADO:`);
            console.log(`   - status: false`);
            console.log(`   - pendingconfirmation: false`);
            console.log(`   - pendinguntil: null`);
            console.log(`   - lasttakentime: ${horaTomada}`);
            console.log(`   - hournextdose: ${proximoHorario}`);
            console.log(
                `✅ [CONFIRM_DOSE] ========== DOSE CONFIRMADA ==========\n`,
            );
        } catch (error) {
            console.error(`❌ [CONFIRM_DOSE] ERRO:`, error);
        }
    }

    async checkMissedDose(medication, agora) {
        try {
            // Se está em confirmação pendente, não verifica como perdida
            if (medication.pendingconfirmation) {
                return;
            }

            console.log(
                `\n⏰ [CHECK_MISSED] ========== VERIFICANDO DOSE PERDIDA ==========`,
            );
            console.log(`⏰ [CHECK_MISSED] Medicamento: ${medication.name}`);
            console.log(
                `⏰ [CHECK_MISSED] Horário programado: ${medication.hournextdose}`,
            );

            // Converte o horário programado para Date de HOJE
            const [horas, minutos] = medication.hournextdose
                .split(':')
                .map(Number);
            const horarioProgramado = new Date(agora);
            horarioProgramado.setHours(horas, minutos, 0, 0);

            if (agora < horarioProgramado) {
                console.log(
                    `⏰ [CHECK_MISSED] ⏩ HORÁRIO AINDA NÃO CHEGOU - IGNORANDO ${horarioProgramado} ${agora}`,
                );
                return;
            }

            const toleranciaMinutos = calcularTolerancia(
                medication.doseinterval.intervalinhours,
            );

            const diffMinutos =
                (agora.getTime() - horarioProgramado.getTime()) / (60 * 1000);

            console.log(
                `⏰ [CHECK_MISSED] Tolerância: ${toleranciaMinutos}min`,
            );
            console.log(
                `⏰ [CHECK_MISSED] Atraso: ${Math.round(diffMinutos)}min`,
            );

            if (diffMinutos > toleranciaMinutos) {
                console.log(`⏰ [CHECK_MISSED] ⚠️ DOSE PERDIDA DETECTADA!`);

                const ultimoRegistro = await models.MedicationHistory.findOne({
                    where: {
                        medicationid: medication.id,
                        takendate: {
                            [Op.gte]: timezone.now(Date.now() - 5 * 60 * 1000),
                        },
                    },
                    order: [['takendate', 'DESC']],
                });

                if (ultimoRegistro) {
                    console.log(
                        `⏰ [CHECK_MISSED] ⚠️ JÁ REGISTRADO - IGNORANDO`,
                    );
                    return;
                }

                await models.MedicationHistory.create({
                    medicationid: medication.id,
                    takendate: agora,
                    taken: false,
                });

                const proximoHorario = this.calcularProximoHorario(
                    medication.hournextdose,
                    medication.doseinterval.intervalinhours,
                );
                console.log(
                    `⏰ [CHECK_MISSED] Próximo horário: ${proximoHorario}`,
                );

                await medication.update({
                    hournextdose: proximoHorario,
                });

                console.log(`⏰ [CHECK_MISSED] Medicamento ATUALIZADO:`);
                console.log(`   - hournextdose: ${proximoHorario}`);
            } else {
                console.log(
                    `⏰ [CHECK_MISSED] ✅ Dentro da tolerância - aguardando`,
                );
            }

            console.log(`⏰ [CHECK_MISSED] ========== FIM ==========\n`);
        } catch (error) {
            console.error(`❌ [CHECK_MISSED] ERRO:`, error);
        }
    }

    calcularProximoHorario(horarioAtual, intervaloHoras) {
        const [horas, minutos] = horarioAtual.split(':').map(Number);
        let totalMinutos = horas * 60 + minutos;
        totalMinutos += intervaloHoras * 60;
        totalMinutos = totalMinutos % (24 * 60);

        const novasHoras = Math.floor(totalMinutos / 60);
        const novosMinutos = totalMinutos % 60;

        return `${novasHoras.toString().padStart(2, '0')}:${novosMinutos.toString().padStart(2, '0')}`;
    }
}

export default new MedicationScheduler();
