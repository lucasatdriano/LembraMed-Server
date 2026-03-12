import cron from 'node-cron';
import { models } from '../models/index.js';
import { Op } from 'sequelize';
import { calcularTolerancia } from '../utils/helpers/dose-rules.helper.js';
import { timezone } from '../utils/formatters/timezone.js';
import { proximaOcorrenciaHorario } from '../utils/helpers/datetime.helper.js';
import medicationNotificationSchedulerService from './medication-notification-scheduler.service.js';

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

        // Armazena o momento da inicialização
        const momentoInicializacao = timezone.now();

        // Executa UMA VEZ o recálculo de doses perdidas
        setTimeout(async () => {
            console.log(
                `\n🔄 Executando recálculo inicial de doses perdidas...`,
            );
            await this.recalcularDosesPerdidas(timezone.now(), null);
        }, 5000); // Aguarda 5 segundos para garantir que tudo carregou

        // RODA A CADA 1 MINUTO (verificação principal)
        cron.schedule('* * * * *', () => {
            this.executionCount++;
            const agora = timezone.now();

            console.log(
                `\n⏰ [CRON #${this.executionCount}] DISPAROU! ${agora.toISOString()}`,
            );

            this.checkMedications();
            medicationNotificationSchedulerService.checkMedicationNotifications();
        });

        this.initialized = true;
        console.log(`⏰ ========== SCHEDULER INICIALIZADO ==========\n`);
    }

    async checkMedications() {
        try {
            console.log(`\n🔍 [SCHEDULER] VERIFICANDO MEDICAMENTOS...`);

            const agora = timezone.now();

            await this.deleteExpiredMedications(agora);

            await this.checkExpiredPendingDoses(agora);

            await this.checkMissedDoses(agora);

            console.log(`\n✅ [SCHEDULER] VERIFICAÇÃO CONCLUÍDA\n`);
        } catch (error) {
            console.error('[SCHEDULER] ERRO:', error);
        }
    }

    /**
     * Deleta medicamentos cujo periodend já passou
     */
    async deleteExpiredMedications(agora) {
        try {
            console.log(
                `\n🗑️ [DELETE_EXPIRED] Verificando medicamentos expirados...`,
            );

            const inicioDoDiaAtual = new Date(agora);
            inicioDoDiaAtual.setHours(0, 0, 0, 0);

            const medicamentosExpirados = await models.Medication.findAll({
                where: {
                    periodend: {
                        [Op.ne]: null,
                        [Op.lt]: inicioDoDiaAtual,
                    },
                },
                attributes: ['id', 'name', 'periodend', 'userid'],
            });

            if (medicamentosExpirados.length === 0) {
                console.log(`✅ Nenhum medicamento expirado encontrado.`);
                return;
            }

            console.log(
                `📊 Encontrados ${medicamentosExpirados.length} medicamentos expirados`,
            );

            for (const med of medicamentosExpirados) {
                console.log(`\n🗑️ Deletando medicamento: ${med.name}`);
                await med.destroy();
                console.log(`✅ Medicamento deletado com sucesso!`);
            }
        } catch (error) {
            console.error('[DELETE_EXPIRED] ERRO:', error);
        }
    }

    async checkExpiredPendingDoses(agora) {
        try {
            console.log(`\n⏰ [EXPIRED_PENDING] ========== INÍCIO ==========`);
            console.log(
                `⏰ [EXPIRED_PENDING] Verificando às: ${agora.toISOString()}`,
            );

            const dosesExpiradas = await models.Medication.findAll({
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
                `⏰ [EXPIRED_PENDING] Encontradas ${dosesExpiradas.length} doses com pendinguntil expirado`,
            );

            for (const med of dosesExpiradas) {
                console.log(`\n📊 [EXPIRED_PENDING] Processando: ${med.name}`);
                console.log(
                    `   - pendinguntil: ${med.pendinguntil} (expirado)`,
                );
                console.log(`   - status: ${med.status}`);
                console.log(
                    `   - pendingconfirmation: ${med.pendingconfirmation}`,
                );

                await this.confirmDose(med, true);
            }
            console.log(`⏰ [EXPIRED_PENDING] ========== FIM ==========\n`);
        } catch (error) {
            console.error('Erro ao verificar doses expiradas:', error);
        }
    }

    encontrarHorarioProgramado(medication, agora) {
        try {
            // Converte hournextdose para objeto Date
            const [hora, minuto] = medication.hournextdose
                .split(':')
                .map(Number);

            // Cria uma data com o horário programado para hoje
            const horarioProgramado = new Date(agora);
            horarioProgramado.setHours(hora, minuto, 0, 0);

            // Se o horário programado for maior que agora, pode ser a dose de amanhã
            // Mas como estamos lidando com pendinguntil, provavelmente é a dose de hoje
            if (horarioProgramado > agora) {
                horarioProgramado.setDate(horarioProgramado.getDate() - 1);
            }

            return horarioProgramado;
        } catch (error) {
            console.error('Erro ao encontrar horário programado:', error);
            return null;
        }
    }

    async confirmDose(medication, taken = true) {
        console.log(`\n✅ [CONFIRM_DOSE] ========== INÍCIO ==========`);
        console.log(`✅ [CONFIRM_DOSE] Medicamento: ${medication.name}`);
        console.log(`✅ [CONFIRM_DOSE] taken: ${taken}`);
        console.log(
            `✅ [CONFIRM_DOSE] hora atual: ${timezone.now().toISOString()}`,
        );
        console.log(`✅ [CONFIRM_DOSE] Estado ANTES:`);
        console.log(`   - status: ${medication.status}`);
        console.log(
            `   - pendingconfirmation: ${medication.pendingconfirmation}`,
        );
        console.log(`   - pendinguntil: ${medication.pendinguntil}`);
        console.log(`   - hournextdose: ${medication.hournextdose}`);

        try {
            const agora = timezone.now();

            if (taken) {
                const registroPerdido = await models.MedicationHistory.findOne({
                    where: {
                        medicationid: medication.id,
                        taken: false,
                        takendate: {
                            [Op.gte]: new Date(agora.getTime() - 5 * 60 * 1000),
                        },
                    },
                });

                if (registroPerdido) {
                    console.log(
                        `⚠️ [CONFIRM_DOSE] Encontrado registro perdido recente:`,
                    );
                    console.log(`   - ID: ${registroPerdido.id}`);
                    console.log(`   - taken: ${registroPerdido.taken}`);
                    console.log(`   - takendate: ${registroPerdido.takendate}`);
                    console.log(`⚠️ [CONFIRM_DOSE] Atualizando para tomada...`);

                    await registroPerdido.update({
                        taken: true,
                        takendate: agora,
                    });

                    console.log(
                        `✅ [CONFIRM_DOSE] Registro atualizado com sucesso`,
                    );
                }
            }

            // Cria novo registro ou continua...
            const historico = await models.MedicationHistory.create({
                medicationid: medication.id,
                takendate: agora,
                taken: taken,
            });

            console.log(`✅ [CONFIRM_DOSE] Histórico criado:`);
            console.log(`   - ID: ${historico.id}`);
            console.log(`   - taken: ${historico.taken}`);
            console.log(`   - takendate: ${historico.takendate}`);

            const horaTomada = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
            const proximoHorario = this.calcularProximoHorarioComData(
                medication,
                taken ? agora : new Date(agora.getTime() + 60 * 1000),
            );

            await medication.update({
                status: false,
                pendingconfirmation: false,
                pendinguntil: null,
                lasttakentime: taken ? horaTomada : null,
                hournextdose: proximoHorario,
            });

            console.log(`✅ [CONFIRM_DOSE] Medicamento ATUALIZADO:`);
            console.log(`   - status: false`);
            console.log(`   - pendingconfirmation: false`);
            console.log(`   - pendinguntil: null`);
            console.log(`   - lasttakentime: ${taken ? horaTomada : 'null'}`);
            console.log(`   - hournextdose: ${proximoHorario}`);
            console.log(`✅ [CONFIRM_DOSE] ========== FIM ==========\n`);
        } catch (error) {
            console.error('[CONFIRM_DOSE] ERRO:', error);
        }
    }

    /**
     * Verifica doses perdidas (não pendentes)
     */
    async checkMissedDoses(agora) {
        console.log(`\n⏰ [MISSED_DOSES] ========== INÍCIO ==========`);
        console.log(`⏰ [MISSED_DOSES] Verificando às: ${agora.toISOString()}`);

        try {
            const medicamentosAtivos = await models.Medication.findAll({
                where: {
                    pendingconfirmation: false,
                    hournextdose: {
                        [Op.ne]: null,
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
                `⏰ [MISSED_DOSES] Medicamentos ativos (pendingconfirmation=false): ${medicamentosAtivos.length}`,
            );

            for (const med of medicamentosAtivos) {
                await this.checkMissedDose(med, agora);
            }
        } catch (error) {
            console.error('[MISSED_DOSES] ERRO:', error);
        }
        console.log(`⏰ [MISSED_DOSES] ========== FIM ==========\n`);
    }

    async checkMissedDose(medication, agora) {
        console.log(`\n📊 [CHECK_MISSED_DOSE] ==========`);
        console.log(`📊 [CHECK_MISSED_DOSE] Medicamento: ${medication.name}`);
        console.log(
            `📊 [CHECK_MISSED_DOSE] pendingconfirmation: ${medication.pendingconfirmation}`,
        );

        if (medication.pendingconfirmation) {
            console.log(
                `📊 [CHECK_MISSED_DOSE] ⏭️ Ignorando - pendingconfirmation = true`,
            );
            return;
        }

        const proximaOcorrencia = proximaOcorrenciaHorario(
            medication.hournextdose,
            agora,
        );

        console.log(
            `📊 [CHECK_MISSED_DOSE] hournextdose: ${medication.hournextdose}`,
        );
        console.log(
            `📊 [CHECK_MISSED_DOSE] proximaOcorrencia: ${proximaOcorrencia.toISOString()}`,
        );
        console.log(`📊 [CHECK_MISSED_DOSE] agora: ${agora.toISOString()}`);
        console.log(
            `📊 [CHECK_MISSED_DOSE] proximaOcorrencia > agora: ${proximaOcorrencia > agora}`,
        );

        if (proximaOcorrencia > agora) {
            console.log(`📊 [CHECK_MISSED_DOSE] ⏭️ Futuro - ignorando`);
            return;
        }

        const toleranciaMinutos = calcularTolerancia(
            medication.doseinterval.intervalinhours,
        );

        const diffMinutos =
            (agora.getTime() - proximaOcorrencia.getTime()) / (60 * 1000);

        console.log(
            `📊 [CHECK_MISSED_DOSE] toleranciaMinutos: ${toleranciaMinutos}`,
        );
        console.log(
            `📊 [CHECK_MISSED_DOSE] diffMinutos: ${diffMinutos.toFixed(2)}`,
        );
        console.log(
            `📊 [CHECK_MISSED_DOSE] diff > tolerancia: ${diffMinutos > toleranciaMinutos}`,
        );

        if (diffMinutos > toleranciaMinutos) {
            console.log(
                `⚠️ [CHECK_MISSED_DOSE] Passou da tolerância! Verificando histórico...`,
            );

            // Busca no histórico
            const doseTomadaNoPeriodo = await models.MedicationHistory.findOne({
                where: {
                    medicationid: medication.id,
                    taken: true,
                    takendate: {
                        [Op.gte]: proximaOcorrencia,
                        [Op.lte]: agora,
                    },
                },
            });

            if (doseTomadaNoPeriodo) {
                console.log(
                    `✅ ${medication.name}: Usuário já tomou às ${new Date(doseTomadaNoPeriodo.takendate).toLocaleTimeString()}, ignorando marcação de perdida`,
                );

                // Atualiza o hournextdose baseado na dose que o usuário tomou
                const proximoHorario = this.calcularProximoHorarioComData(
                    medication,
                    new Date(doseTomadaNoPeriodo.takendate), // Usa a data que o usuário tomou
                );

                await medication.update({
                    hournextdose: proximoHorario,
                });

                console.log(
                    `✅ ${medication.name} atualizado - Próxima dose: ${proximoHorario}`,
                );
                return;
            }

            console.log(
                `⚠️ [CHECK_MISSED_DOSE] Nenhum registro de tomada - registrando como perdida`,
            );

            console.log(`⚠️ Dose perdida detectada: ${medication.name}`);

            // Verifica se já registrou nos últimos minutos
            const ultimoRegistro = await models.MedicationHistory.findOne({
                where: {
                    medicationid: medication.id,
                    takendate: {
                        [Op.gte]: new Date(agora.getTime() - 5 * 60 * 1000),
                    },
                },
            });

            if (ultimoRegistro) {
                return;
            }

            // Registra dose perdida
            await models.MedicationHistory.create({
                medicationid: medication.id,
                takendate: agora,
                taken: false,
            });

            // Calcula próximo horário
            const proximoHorario = this.calcularProximoHorarioComData(
                medication,
                agora,
            );

            await medication.update({
                hournextdose: proximoHorario,
            });

            console.log(`✅ Dose perdida registrada - Próx: ${proximoHorario}`);
        }
        console.log(`📊 [CHECK_MISSED_DOSE] ========== FIM ==========\n`);
    }

    async recalcularDosesPerdidas(agora, ultimaExecucao) {
        try {
            console.log(
                `\n🔄 [RECALCULO] Verificando doses perdidas desde ${ultimaExecucao?.toISOString() || 'início'}`,
            );

            const medicamentosAtivos = await models.Medication.findAll({
                where: {
                    pendingconfirmation: false,
                    hournextdose: { [Op.ne]: null },
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
                `📊 Total de medicamentos ativos: ${medicamentosAtivos.length}`,
            );

            for (const med of medicamentosAtivos) {
                try {
                    // Se não tem última execução, considera apenas o período do medicamento
                    if (!ultimaExecucao) {
                        await this.verificarDosesPerdidasDesdeInicio(
                            med,
                            agora,
                        );
                    } else {
                        await this.verificarDosesPerdidasNoPeriodo(
                            med,
                            ultimaExecucao,
                            agora,
                        );
                    }
                } catch (medError) {
                    console.error(
                        `❌ Erro ao processar medicamento ${med.name}:`,
                        medError,
                    );
                    // Continua com o próximo medicamento
                    continue;
                }
            }

            console.log(`[RECALCULO] Processamento concluído!`);
        } catch (error) {
            console.error('[RECALCULO] ERRO GERAL:', error);
        }
    }

    async verificarDosesPerdidasDesdeInicio(medication, agora) {
        try {
            console.log(
                `\n📊 Verificando doses perdidas desde o início para: ${medication.name}`,
            );

            const intervaloHoras = medication.doseinterval.intervalinhours;
            const intervaloMs = intervaloHoras * 60 * 60 * 1000;

            // Busca o último registro no histórico
            const ultimoRegistro = await models.MedicationHistory.findOne({
                where: { medicationid: medication.id },
                order: [['takendate', 'DESC']],
            });

            // Define a data de referência (último registro OU data de início do medicamento)
            let dataReferencia;
            if (ultimoRegistro) {
                dataReferencia = new Date(ultimoRegistro.takendate);
                console.log(
                    `📅 Último registro encontrado: ${dataReferencia.toISOString()}`,
                );
            } else {
                // Se não tem histórico, usa periodstart ou 7 dias atrás (para não sobrecarregar)
                dataReferencia = medication.periodstart
                    ? new Date(medication.periodstart)
                    : new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 dias atrás
                console.log(
                    `📅 Sem histórico, usando data referência: ${dataReferencia.toISOString()}`,
                );
            }

            // Converte hournextdose para objeto Date
            const [horaNext, minutoNext] = medication.hournextdose
                .split(':')
                .map(Number);

            // Encontra a primeira dose após a data de referência
            let primeiraDose = new Date(dataReferencia);
            primeiraDose.setHours(horaNext, minutoNext, 0, 0);

            // Se a primeira dose calculada for anterior à data de referência, avança
            while (primeiraDose <= dataReferencia) {
                primeiraDose = new Date(primeiraDose.getTime() + intervaloMs);
            }

            console.log(
                `🕐 Primeira dose após referência: ${primeiraDose.toISOString()}`,
            );

            // Verifica todas as doses que deveriam ter ocorrido até AGORA
            let dosesPerdidas = [];
            let doseAtual = new Date(primeiraDose);
            let count = 0;

            while (doseAtual <= agora) {
                dosesPerdidas.push(new Date(doseAtual));
                doseAtual = new Date(doseAtual.getTime() + intervaloMs);
                count++;
            }

            if (dosesPerdidas.length > 0) {
                console.log(
                    `⚠️ ${medication.name}: ${dosesPerdidas.length} doses perdidas detectadas (desde ${dataReferencia.toISOString()})`,
                );

                // Registra cada dose perdida (em lotes para não sobrecarregar)
                const batchSize = 50;
                for (let i = 0; i < dosesPerdidas.length; i += batchSize) {
                    const batch = dosesPerdidas.slice(i, i + batchSize);
                    const historyEntries = batch.map((dose) => ({
                        medicationid: medication.id,
                        takendate: dose,
                        taken: false,
                    }));

                    await models.MedicationHistory.bulkCreate(historyEntries);
                    console.log(
                        `📝 Lote ${Math.floor(i / batchSize) + 1}: ${batch.length} doses registradas`,
                    );
                }

                // Atualiza para a PRÓXIMA dose futura
                const proximaDoseFormatada = `${doseAtual.getHours().toString().padStart(2, '0')}:${doseAtual.getMinutes().toString().padStart(2, '0')}`;

                await medication.update({
                    hournextdose: proximaDoseFormatada,
                    status: false,
                });

                console.log(
                    `✅ ${medication.name} atualizado - Próxima dose: ${proximaDoseFormatada}`,
                );

                // Opcional: Disparar notificações para doses perdidas
                if (dosesPerdidas.length > 0) {
                    console.log(
                        `📱 Seriam disparadas ${dosesPerdidas.length} notificações de doses perdidas`,
                    );
                    // Aqui você pode integrar com seu sistema de notificações
                }
            } else {
                console.log(
                    `✅ ${medication.name}: Nenhuma dose perdida encontrada`,
                );
            }
        } catch (error) {
            console.error(
                `❌ [VERIFICAR_DESDE_INICIO] ERRO para ${medication.name}:`,
                error,
            );
        }
    }

    async verificarDosesPerdidasNoPeriodo(medication, inicio, fim) {
        const intervaloHoras = medication.doseinterval.intervalinhours;
        const intervaloMs = intervaloHoras * 60 * 60 * 1000;

        // Obtém o horário da próxima dose programada
        const [hora, minuto] = medication.hournextdose.split(':').map(Number);
        let doseProgramada = new Date(fim);
        doseProgramada.setHours(hora, minuto, 0, 0);

        // Volta no tempo para encontrar a primeira dose no período
        while (doseProgramada > fim) {
            doseProgramada = new Date(doseProgramada.getTime() - intervaloMs);
        }

        // Avança no tempo para verificar todas as doses no período
        while (doseProgramada <= fim) {
            if (doseProgramada >= inicio) {
                console.log(
                    `⚠️ Dose perdida detectada: ${medication.name} em ${doseProgramada.toISOString()}`,
                );

                // Registra a dose perdida
                await models.MedicationHistory.create({
                    medicationid: medication.id,
                    takendate: doseProgramada,
                    taken: false,
                });
            }

            doseProgramada = new Date(doseProgramada.getTime() + intervaloMs);
        }

        // Atualiza para a próxima dose FUTURA
        let proximaDose = new Date(doseProgramada);
        while (proximaDose <= fim) {
            proximaDose = new Date(proximaDose.getTime() + intervaloMs);
        }

        const proximaDoseFormatada = `${proximaDose.getHours().toString().padStart(2, '0')}:${proximaDose.getMinutes().toString().padStart(2, '0')}`;

        await medication.update({
            hournextdose: proximaDoseFormatada,
        });

        console.log(
            `✅ ${medication.name} atualizado - Próxima dose: ${proximaDoseFormatada}`,
        );
    }

    calcularProximoHorarioComData(medication, agora) {
        const intervalo = medication.doseinterval.intervalinhours;

        // Para intervalos de 24h ou mais, mantém o mesmo horário
        if (intervalo >= 24) {
            return medication.hournextdose;
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
