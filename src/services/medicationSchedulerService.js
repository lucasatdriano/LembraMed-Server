import cron from 'node-cron';
import { models } from '../models/index.js';
import { Op } from 'sequelize';
import { format, toZonedTime } from 'date-fns-tz';
import { calcularTolerancia } from '../utils/doseRules.js'; // 🔴 FALTANDO!

class MedicationScheduler {
    constructor() {
        this.initialized = false;
        this.timeZone = 'America/Sao_Paulo';
    }

    init() {
        if (this.initialized) return;

        console.log('⏰ Iniciando scheduler de medicamentos...');
        console.log(`🌎 Fuso horário configurado: ${this.timeZone}`);

        cron.schedule('* * * * *', () => {
            this.checkMedications();
        });

        this.initialized = true;
    }

    getLocalTime() {
        const agora = new Date();
        const zonedDate = toZonedTime(agora, this.timeZone);
        return {
            horaLocal: format(zonedDate, 'HH:mm'),
            dataLocal: format(zonedDate, 'yyyy-MM-dd HH:mm:ss'),
            dataOriginal: agora,
        };
    }

    async checkMedications() {
        try {
            // ✅ CASO 1: Confirmar doses pendentes (3 minutos já passaram)
            const dosesParaConfirmar = await models.Medication.findAll({
                where: {
                    status: true,
                    pendingconfirmation: true,
                    pendinguntil: {
                        [Op.lte]: new Date(), // Já passou dos 3 minutos
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

            for (const med of dosesParaConfirmar) {
                await this.confirmDose(med);
            }

            // ✅ CASO 2: Detectar doses perdidas (passou da tolerância)
            const medicamentosAtrasados = await models.Medication.findAll({
                where: {
                    status: false, // Não tomou
                    pendingconfirmation: false, // Não está em confirmação
                },
                include: [
                    {
                        model: models.DoseIntervals,
                        as: 'doseinterval',
                        attributes: ['intervalinhours'],
                    },
                ],
            });

            for (const med of medicamentosAtrasados) {
                await this.checkMissedDose(med);
            }
        } catch (error) {
            console.error('❌ Erro no scheduler:', error);
        }
    }

    /**
     * ✅ Confirmar dose APÓS 3 minutos (ÚNICA FUNÇÃO CORRETA)
     */
    async confirmDose(medication) {
        try {
            console.log(`✅ Confirmando dose: ${medication.name}`);
            console.log(`   Horário agendado: ${medication.hournextdose}`);
            console.log(`   PendingUntil: ${medication.pendinguntil}`);

            // 1. Registra no histórico como TOMADO
            await models.MedicationHistory.create({
                medicationid: medication.id,
                takendate: new Date(),
                taken: true,
            });

            // 2. Salva a hora que ele tomou
            const agora = new Date();
            const horaTomada = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;

            // 3. Calcula PRÓXIMO horário baseado no horário CORRETO
            const proximoHorario = this.calcularProximoHorario(
                medication.hournextdose, // USA O HORÁRIO AGENDADO!
                medication.doseinterval.intervalinhours,
            );

            // 4. Reseta o medicamento
            await medication.update({
                status: false, // ✅ Isso já faz!
                pendingconfirmation: false,
                pendinguntil: null,
                lasttakentime: horaTomada,
                hournextdose: proximoHorario,
            });

            this.notifyMedicationUpdated(medication.id, {
                status: false,
                pendingConfirmation: false,
                pendingUntil: null,
                hournextdose: proximoHorario,
            });

            console.log(`✅ Dose confirmada: ${medication.name}`);
            console.log(`   Próximo horário: ${proximoHorario}`);
            console.log(`   Hora tomada: ${horaTomada}`);
        } catch (error) {
            console.error(`❌ Erro ao confirmar dose ${medication.id}:`, error);
        }
    }

    /**
     * ⏰ Verificar dose perdida (tolerância de 1/5 do intervalo)
     */
    async checkMissedDose(medication) {
        try {
            const toleranciaMinutos = calcularTolerancia(
                medication.doseinterval.intervalinhours,
            );

            const [horas, minutos] = medication.hournextdose
                .split(':')
                .map(Number);
            const horarioCorreto = new Date();
            horarioCorreto.setHours(horas, minutos, 0, 0);

            const diffMinutos =
                (Date.now() - horarioCorreto.getTime()) / (60 * 1000);

            if (diffMinutos > toleranciaMinutos) {
                console.log(`⏰ DOSE PERDIDA: ${medication.name}`);
                console.log(`   Horário: ${medication.hournextdose}`);
                console.log(`   Tolerância: ${toleranciaMinutos}min`);
                console.log(`   Atraso: ${Math.round(diffMinutos)}min`);

                // Registra como NÃO TOMADO
                await models.MedicationHistory.create({
                    medicationid: medication.id,
                    takendate: new Date(),
                    taken: false,
                });

                // Calcula próximo horário
                const proximoHorario = this.calcularProximoHorario(
                    medication.hournextdose,
                    medication.doseinterval.intervalinhours,
                );

                await medication.update({
                    hournextdose: proximoHorario,
                    status: false,
                    pendingconfirmation: false,
                    pendinguntil: null,
                });

                console.log(`   Próximo horário: ${proximoHorario}`);
            }
        } catch (error) {
            console.error(
                `❌ Erro ao verificar dose perdida ${medication.id}:`,
                error,
            );
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

    // ❌ REMOVER função duplicada!
    // async confirmPendingDose(medication) { ... }

    // ❌ REMOVER função não utilizada!
    // async processMedicationTime(medication) { ... }
}

export default new MedicationScheduler();
