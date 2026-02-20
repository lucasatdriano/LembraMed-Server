import cron from 'node-cron';
import { models } from '../models/index.js';
import { Op } from 'sequelize';
import { calcularTolerancia } from '../utils/helpers/dose-rules.helper.js';
import { timezone } from '../utils/formatters/timezone.js';
import { proximaOcorrenciaHorario } from '../utils/helpers/dateTime.helper.js';

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

            // ================================
            // 1️⃣ DELETAR EXPIRADOS (MANTIDO)
            // ================================
            await this.deleteExpiredMedications(agora);

            // ================================
            // 2️⃣ CONFIRMAR DOSES AUTOMÁTICAS (PERFEITO - MANTIDO)
            // ================================
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
                `🔍 [SCHEDULER] Doses para confirmar: ${dosesParaConfirmar.length}`,
            );

            for (const med of dosesParaConfirmar) {
                await this.confirmDose(med);
            }

            // ================================
            // 3️⃣ BUSCA INTELIGENTE DE DOSES POSSIVELMENTE PERDIDAS
            // 🔥 AQUI ESTÁ A OTIMIZAÇÃO REAL
            // ================================
            const medicamentosAtivos = await models.Medication.findAll({
                where: {
                    status: true,
                    pendingconfirmation: false,
                    hournextdose: {
                        [Op.ne]: null,
                    },
                    [Op.or]: [
                        // Sem período (contínuo)
                        {
                            periodstart: null,
                            periodend: null,
                        },
                        // Dentro do período válido
                        {
                            [Op.and]: [
                                { periodstart: { [Op.lte]: agora } },
                                { periodend: { [Op.gte]: agora } },
                            ],
                        },
                    ],
                },
                include: [
                    {
                        model: models.DoseIntervals,
                        as: 'doseinterval',
                        attributes: ['intervalinhours'],
                    },
                ],
                attributes: [
                    'id',
                    'name',
                    'hournextdose',
                    'pendingconfirmation',
                    'periodstart',
                    'periodend',
                ],
            });

            console.log(
                `🔍 [SCHEDULER] Medicamentos ativos relevantes: ${medicamentosAtivos.length}`,
            );

            for (const med of medicamentosAtivos) {
                await this.checkMissedDose(med, agora);
            }

            console.log(
                `\n✅ [SCHEDULER #${this.executionCount}] VERIFICAÇÃO CONCLUÍDA\n`,
            );
        } catch (error) {
            console.error('❌ [SCHEDULER] ERRO:', error);
        }
    }

    /**
     * Deleta medicamentos cujo periodend já passou
     * ✅ Medicamentos SEM periodend (null) NÃO são deletados
     */
    async deleteExpiredMedications(agora) {
        try {
            console.log(
                `\n [DELETE_EXPIRED] ========== VERIFICANDO MEDICAMENTOS EXPIRADOS ==========`,
            );

            // Cria uma data para o início do dia atual (00:00:00)
            const inicioDoDiaAtual = new Date(agora);
            inicioDoDiaAtual.setHours(0, 0, 0, 0);

            console.log(`🗓️ Data atual: ${agora.toISOString()}`);
            console.log(
                `🗓️ Início do dia atual: ${inicioDoDiaAtual.toISOString()}`,
            );

            // Busca medicamentos que:
            // 1. TÊM periodend definido (NÃO é null)
            // 2. periodend é anterior ao início do dia atual
            const medicamentosExpirados = await models.Medication.findAll({
                where: {
                    periodend: {
                        [Op.ne]: null,
                        [Op.lt]: inicioDoDiaAtual,
                    },
                },
                attributes: ['id', 'name', 'periodend'],
            });

            if (medicamentosExpirados.length === 0) {
                console.log(`✅ Nenhum medicamento expirado encontrado.`);
                console.log(`🗑️ [DELETE_EXPIRED] ========== FIM ==========\n`);
                return;
            }

            console.log(
                `📊 Encontrados ${medicamentosExpirados.length} medicamentos expirados:`,
            );
            medicamentosExpirados.forEach((med) => {
                console.log(
                    `   - ${med.name} (ID: ${med.id}) - PeriodEnd: ${med.periodend}`,
                );
            });

            for (const med of medicamentosExpirados) {
                console.log(`\n Deletando medicamento: ${med.name}`);

                // ✅ Usa o método destroy diretamente (cascade do banco cuida do histórico)
                await med.destroy();

                console.log(`   ✅ Medicamento deletado com sucesso!`);
            }

            console.log(
                `\n✅ Total de ${medicamentosExpirados.length} medicamentos expirados deletados.`,
            );
            console.log(`🗑️ [DELETE_EXPIRED] ========== FIM ==========\n`);
        } catch (error) {
            console.error('❌ [DELETE_EXPIRED] ERRO:', error);
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

            const proximoHorario = this.calcularProximoHorarioComData(
                medication,
                agora,
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

            // USA A FUNÇÃO CORRIGIDA QUE CONSIDERA DATAS
            const proximaOcorrencia = proximaOcorrenciaHorario(
                medication.hournextdose,
                agora,
            );

            const horarioProgramado = proximaOcorrencia;

            console.log(
                `⏰ [CHECK_MISSED] Data/hora programada: ${horarioProgramado.toISOString()}`,
            );
            console.log(
                `⏰ [CHECK_MISSED] Data/hora atual: ${agora.toISOString()}`,
            );

            // Se a data programada é no futuro, não perdeu ainda
            if (horarioProgramado > agora) {
                console.log(
                    `⏰ [CHECK_MISSED] ⏩ Dose programada para o futuro - IGNORANDO`,
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

                // Para intervalos >= 24h, não marca como perdida se for do dia anterior
                if (medication.doseinterval.intervalinhours >= 24) {
                    const umDiaAtras = new Date(
                        agora.getTime() - 24 * 60 * 60 * 1000,
                    );

                    // Se a dose programada era de ontem e estamos no horário de hoje, não perdeu
                    if (horarioProgramado < umDiaAtras) {
                        console.log(
                            `⏰ [CHECK_MISSED] ⚠️ Dose do dia anterior - IGNORANDO`,
                        );

                        // Atualiza para o horário de hoje
                        const horarioHoje = proximaOcorrenciaHorario(
                            medication.hournextdose,
                            agora,
                        );

                        await medication.update({
                            hournextdose: horarioHoje
                                .toTimeString()
                                .slice(0, 5),
                        });

                        console.log(
                            `⏰ [CHECK_MISSED] Horário ajustado para hoje: ${horarioHoje}`,
                        );
                        return;
                    }
                }

                // Verifica se já registrou nos últimos minutos
                const ultimoRegistro = await models.MedicationHistory.findOne({
                    where: {
                        medicationid: medication.id,
                        takendate: {
                            [Op.gte]: new Date(agora.getTime() - 5 * 60 * 1000),
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

                // Registra dose perdida
                await models.MedicationHistory.create({
                    medicationid: medication.id,
                    takendate: agora,
                    taken: false,
                });

                // Calcula próximo horário baseado na data atual
                const proximoHorario = this.calcularProximoHorarioComData(
                    medication,
                    agora,
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

    calcularProximoHorarioComData(medication, agora) {
        const intervalo = medication.doseinterval.intervalinhours;

        // Para intervalos de 24h ou mais, mantém o mesmo horário
        if (intervalo >= 24) {
            return medication.hournextdose; // Mantém o mesmo horário
        }

        // Para intervalos menores, calcula baseado na última dose
        const [horas, minutos] = medication.hournextdose.split(':').map(Number);
        const proximaDose = new Date(agora);
        proximaDose.setHours(horas, minutos, 0, 0);

        // Adiciona ciclos até passar de agora
        while (proximaDose <= agora) {
            proximaDose.setHours(proximaDose.getHours() + intervalo);
        }

        return proximaDose.toTimeString().slice(0, 5);
    }
}

export default new MedicationScheduler();
