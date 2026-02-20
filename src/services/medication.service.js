import { Sequelize, Op } from 'sequelize';
import { models } from '../models/index.js';
import { timezone } from '../utils/formatters/timezone.js';
import {
    calcularTolerancia,
    verificarIntervaloMinimo,
} from '../utils/helpers/dose-rules.helper.js';
import { calculateNextDateTime } from '../utils/helpers/calculate-next-datetime.helper.js';

export class MedicationService {
    static async getMedications(userId, page, limit) {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const offset = (pageNumber - 1) * limitNumber;

        const { count, rows: medications } =
            await models.Medication.findAndCountAll({
                where: { userid: userId },
                attributes: [
                    'id',
                    'name',
                    'hournextdose',
                    'periodstart',
                    'periodend',
                    'status',
                    'pendingconfirmation',
                    'pendinguntil',
                    'lasttakentime',
                    'createdat',
                ],
                include: [
                    {
                        model: models.DoseIntervals,
                        as: 'doseinterval',
                        attributes: ['id', 'intervalinhours'],
                    },
                    {
                        model: models.MedicationHistory,
                        as: 'history',
                        limit: 10,
                        order: [['createdat', 'DESC']],
                    },
                ],
                limit: parseInt(limit),
                offset: offset,
            });

        const medicationsWithNextDate = medications.map((med) => {
            const medJson = med.toJSON();
            medJson.nextDateTime = calculateNextDateTime(medJson);
            return medJson;
        });

        const activeMedications = medicationsWithNextDate
            .filter((med) => med.nextDateTime !== null)
            .sort((a, b) => a.nextDateTime - b.nextDateTime);

        const inactiveMedications = medicationsWithNextDate.filter(
            (med) => med.nextDateTime === null,
        );

        const allMedications = [...activeMedications, ...inactiveMedications];

        return {
            medications: allMedications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalRecords: count,
                hasNext: offset + medications.length < count,
                hasPrev: page > 1,
            },
        };
    }

    static async getMedicationById(userId, medicationId) {
        const medication = await models.Medication.findOne({
            where: {
                id: medicationId,
                userid: userId,
            },
            attributes: [
                'id',
                'name',
                'hournextdose',
                'periodstart',
                'periodend',
                'status',
                'pendingconfirmation',
                'pendinguntil',
                'lasttakentime',
                'createdat',
            ],
            include: [
                {
                    model: models.DoseIntervals,
                    as: 'doseinterval',
                    attributes: ['id', 'intervalinhours'],
                },
                {
                    model: models.MedicationHistory,
                    as: 'history',
                    order: [['createdat', 'DESC']],
                    limit: 20,
                },
            ],
        });

        return medication;
    }

    static async findMedications(userId, search, page, limit) {
        const whereClause = { userid: userId };
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const offset = (pageNumber - 1) * limitNumber;

        if (search) {
            const searchLower = search.toLowerCase();
            const orConditions = [{ name: { [Op.like]: `%${searchLower}%` } }];

            if (!isNaN(Number(search))) {
                orConditions.push(
                    Sequelize.where(
                        Sequelize.col('doseinterval.intervalinhours'),
                        Number(search),
                    ),
                );
            }

            whereClause[Op.or] = orConditions;
        }

        const { count, rows: medications } =
            await models.Medication.findAndCountAll({
                where: whereClause,
                attributes: [
                    'id',
                    'name',
                    'hournextdose',
                    'periodstart',
                    'periodend',
                    'status',
                    'pendingconfirmation',
                    'pendinguntil',
                    'createdat',
                ],
                include: [
                    {
                        model: models.DoseIntervals,
                        as: 'doseinterval',
                        attributes: ['intervalinhours'],
                    },
                ],
                limit: parseInt(limit),
                offset: offset,
            });

        const medicationsWithNextDate = medications.map((med) => {
            const medJson = med.toJSON();
            medJson.nextDateTime = calculateNextDateTime(medJson);
            return medJson;
        });

        const activeMedications = medicationsWithNextDate
            .filter((med) => med.nextDateTime !== null)
            .sort((a, b) => a.nextDateTime - b.nextDateTime);

        const inactiveMedications = medicationsWithNextDate.filter(
            (med) => med.nextDateTime === null,
        );

        const allMedications = [...activeMedications, ...inactiveMedications];

        return {
            medications: allMedications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalRecords: count,
                hasNext: offset + medications.length < count,
                hasPrev: page > 1,
            },
        };
    }

    static async getMedicationHistory(userId, medicationId, filters) {
        const { startDate, endDate, status, page, limit } = filters;

        const medication = await models.Medication.findOne({
            where: {
                id: medicationId,
                userid: userId,
            },
        });

        if (!medication) {
            throw new Error('Medicamento não encontrado');
        }

        const whereClause = { medicationid: medicationId };

        if (startDate || endDate) {
            whereClause.takendate = {};
            if (startDate)
                whereClause.takendate[Op.gte] = timezone.now(startDate);
            if (endDate) whereClause.takendate[Op.lte] = timezone.now(endDate);
        }

        if (status && status !== 'all') {
            whereClause.taken = status === 'taken';
        }

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const offset = (pageNumber - 1) * limitNumber;

        const { count, rows: history } =
            await models.MedicationHistory.findAndCountAll({
                where: whereClause,
                order: [['takendate', 'DESC']],
                limit: parseInt(limit),
                offset: offset,
            });

        return {
            history,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalRecords: count,
                hasNext: offset + history.length < count,
                hasPrev: page > 1,
            },
        };
    }

    static async createMedication(userId, data) {
        const { name, hourfirstdose, periodstart, periodend, intervalinhours } =
            data;

        let doseInterval = await models.DoseIntervals.findOne({
            where: { intervalinhours },
        });

        if (!doseInterval) {
            doseInterval = await models.DoseIntervals.create({
                intervalinhours,
            });
        }

        const adjustedPeriodStart = timezone.startOfDay(periodstart);
        const adjustedPeriodEnd = timezone.endOfDay(periodend);

        const newMedication = await models.Medication.create({
            name: name.toLowerCase().trim(),
            hourfirstdose,
            periodstart: adjustedPeriodStart,
            periodend: adjustedPeriodEnd,
            status: false,
            pendingconfirmation: false,
            pendinguntil: null,
            lasttakentime: null,
            userid: userId,
            doseintervalid: doseInterval.id,
            hournextdose: hourfirstdose,
        });

        const medicationWithDetails = await models.Medication.findByPk(
            newMedication.id,
            {
                include: [
                    {
                        model: models.DoseIntervals,
                        as: 'doseinterval',
                        attributes: ['id', 'intervalinhours'],
                    },
                ],
            },
        );

        return medicationWithDetails;
    }

    static async registerPendingConfirmation(userId, medicationId) {
        console.log(`\n🔵 [REGISTER_PENDING] ========== INÍCIO ==========`);
        console.log(`🔵 [REGISTER_PENDING] Medicamento ID: ${medicationId}`);
        console.log(`🔵 [REGISTER_PENDING] Usuário ID: ${userId}`);

        const agora = timezone.now();
        console.log(`🔵 [REGISTER_PENDING] Timestamp: ${agora.toISOString()}`);

        const medication = await models.Medication.findOne({
            where: { id: medicationId, userid: userId },
            include: [
                {
                    model: models.DoseIntervals,
                    as: 'doseinterval',
                    attributes: ['intervalinhours'],
                },
            ],
        });

        if (!medication) {
            console.log(`🔴 [REGISTER_PENDING] Medicamento NÃO encontrado!`);
            throw new Error('Medicamento não encontrado');
        }

        console.log(
            `🔵 [REGISTER_PENDING] Medicamento encontrado: ${medication.name}`,
        );
        console.log(`🔵 [REGISTER_PENDING] Estado ATUAL:`);
        console.log(`   - status: ${medication.status}`);
        console.log(
            `   - pendingconfirmation: ${medication.pendingconfirmation}`,
        );
        console.log(`   - pendinguntil: ${medication.pendinguntil}`);
        console.log(`   - hournextdose: ${medication.hournextdose}`);
        console.log(`   - lasttakentime: ${medication.lasttakentime}`);

        const horaCorreta = medication.hournextdose;
        const intervaloHoras = medication.doseinterval.intervalinhours;
        const toleranciaMinutos = calcularTolerancia(intervaloHoras);

        const [horas, minutos] = horaCorreta.split(':').map(Number);

        const doseHoje = timezone.now(agora);
        doseHoje.setHours(horas, minutos, 0, 0);

        console.log(`\n🔵 [REGISTER_PENDING] ===== ANÁLISE DA DOSE =====`);
        console.log(
            `🔵 [REGISTER_PENDING] Dose de hoje: ${doseHoje.toISOString()}`,
        );
        console.log(`🔵 [REGISTER_PENDING] Agora: ${agora.toISOString()}`);

        const inicioJanela = new Date(doseHoje);
        inicioJanela.setHours(doseHoje.getHours() - 2, 0, 0, 0);

        const fimJanela = new Date(doseHoje);
        fimJanela.setMinutes(doseHoje.getMinutes() + toleranciaMinutos);

        console.log(
            `\n🔵 [REGISTER_PENDING] ===== JANELA DA DOSE DE HOJE =====`,
        );
        console.log(
            `🔵 [REGISTER_PENDING] Início da janela (4h antes): ${inicioJanela.toISOString()}`,
        );
        console.log(
            `🔵 [REGISTER_PENDING] Fim da janela (${toleranciaMinutos}min depois): ${fimJanela.toISOString()}`,
        );
        console.log(`🔵 [REGISTER_PENDING] Agora: ${agora.toISOString()}`);

        if (agora < inicioJanela) {
            console.log(`🔵 [REGISTER_PENDING] ❌ Antes da janela abrir`);

            const horaInicio = inicioJanela
                .getHours()
                .toString()
                .padStart(2, '0');
            const minInicio = inicioJanela
                .getMinutes()
                .toString()
                .padStart(2, '0');

            const error = new Error(
                'Aguarde o intervalo mínimo de 2 horas, antes de tomar a próxima dose.',
            );
            error.details = {
                message: `A janela para esta dose abre às ${horaInicio}:${minInicio}.`,
                doseHoje: doseHoje.toISOString(),
                inicioJanela: inicioJanela.toISOString(),
                fimJanela: fimJanela.toISOString(),
                agora: agora.toISOString(),
                intervaloHoras,
                toleranciaMinutos,
            };
            throw error;
        }

        if (agora > fimJanela) {
            console.log(`🔵 [REGISTER_PENDING] ❌ Depois da janela fechar`);

            const horaInicio = inicioJanela
                .getHours()
                .toString()
                .padStart(2, '0');
            const minInicio = inicioJanela
                .getMinutes()
                .toString()
                .padStart(2, '0');
            const toleranciaHoras = (toleranciaMinutos / 60).toFixed(1);

            const error = new Error(
                'Aguarde o intervalo mínimo de 2 horas, antes de tomar a próxima dose.',
            );
            error.details = {
                message: `A janela para esta dose fechou. Próxima janela abre amanhã às ${horaInicio}:${minInicio}.`,
                doseHoje: doseHoje.toISOString(),
                inicioJanela: inicioJanela.toISOString(),
                fimJanela: fimJanela.toISOString(),
                agora: agora.toISOString(),
                intervaloHoras,
                toleranciaMinutos,
                toleranciaHoras: `${toleranciaHoras} horas`,
            };
            throw error;
        }

        console.log(`🔵 [REGISTER_PENDING] ✅ DENTRO DA JANELA DE MARCAÇÃO!`);

        const diffMinutos =
            (agora.getTime() - doseHoje.getTime()) / (60 * 1000);

        console.log(
            `\n🔵 [REGISTER_PENDING] Horário alvo: ${doseHoje.toISOString()}`,
        );
        console.log(
            `🔵 [REGISTER_PENDING] Diferença: ${Math.round(diffMinutos)} minutos`,
        );
        console.log(
            `🔵 [REGISTER_PENDING] Tolerância: ${toleranciaMinutos} minutos`,
        );

        if (diffMinutos > toleranciaMinutos) {
            console.log(`🔴 [REGISTER_PENDING] DOSE JÁ PERDIDA!`);
            const error = new Error(
                'Esta dose já está perdida. A próxima dose será no horário calculado.',
            );
            error.details = {
                doseHoje: doseHoje.toISOString(),
                atrasoMinutos: Math.round(diffMinutos),
                toleranciaMinutos,
            };
            throw error;
        }

        const validacaoIntervalo = verificarIntervaloMinimo(medication, agora);

        if (!validacaoIntervalo.valido) {
            const error = new Error('Intervalo mínimo não respeitado');
            error.details = {
                message: validacaoIntervalo.mensagem,
                ...validacaoIntervalo.detalhes,
            };
            throw error;
        }

        let tipoDose;
        if (diffMinutos < 0) {
            tipoDose = 'adiantado';
        } else {
            tipoDose = 'no horário (dentro da tolerância)';
        }

        let pendingUntil;
        let mensagem;

        if (diffMinutos < 0) {
            pendingUntil = doseHoje.getTime() + 3 * 60 * 1000;
            const horaPending = new Date(pendingUntil)
                .toTimeString()
                .slice(0, 5);
            mensagem = `Dose adiantada. Aguardando confirmação às ${horaPending}.`;
            console.log(
                `🔵 [REGISTER_PENDING] Clique ADIANTADO (antes das ${horaCorreta})`,
            );
        } else {
            pendingUntil = agora.getTime() + 3 * 60 * 1000;
            const horaPending = new Date(pendingUntil)
                .toTimeString()
                .slice(0, 5);
            mensagem = `Dose registrada. Aguardando confirmação às ${horaPending}.`;
            console.log(
                `🔵 [REGISTER_PENDING] Clique DENTRO da tolerância (após ${horaCorreta})`,
            );
        }

        await medication.update({
            status: true,
            pendingconfirmation: true,
            pendinguntil: pendingUntil,
        });

        const medicationAtualizada = await models.Medication.findByPk(
            medicationId,
            {
                include: [
                    {
                        model: models.DoseIntervals,
                        as: 'doseinterval',
                        attributes: ['id', 'intervalinhours'],
                    },
                ],
            },
        );

        console.log(`\n🟢 [REGISTER_PENDING] Medicamento ATUALIZADO:`);
        console.log(`   - status: true`);
        console.log(`   - pendingconfirmation: true`);
        console.log(
            `   - pendinguntil: ${new Date(pendingUntil).toISOString()}`,
        );
        console.log(
            `   - hournextdose: ${medication.hournextdose} (NÃO ALTERADO)`,
        );
        console.log(`   - Mensagem: ${mensagem}`);
        console.log(`🔵 [REGISTER_PENDING] ========== FIM ==========\n`);

        return {
            message: mensagem,
            medication: {
                id: medicationAtualizada.id,
                name: medicationAtualizada.name,
                status: medicationAtualizada.status,
                pendingconfirmation: medicationAtualizada.pendingconfirmation,
                pendinguntil: medicationAtualizada.pendinguntil,
                hournextdose: medicationAtualizada.hournextdose,
                lasttakentime: medicationAtualizada.lasttakentime,
                doseinterval: medicationAtualizada.doseinterval,
                metadata: {
                    doseDoDia: doseHoje.toISOString(),
                    tipoMarcacao: tipoDose,
                    horaProgramada: horaCorreta,
                    intervaloHoras,
                    toleranciaMinutos,
                    janela: {
                        inicio: inicioJanela.toISOString(),
                        fim: fimJanela.toISOString(),
                        horasAntes: 4,
                        horasDepois: (toleranciaMinutos / 60).toFixed(1),
                    },
                },
            },
        };
    }

    static async cancelPendingDose(userId, medicationId) {
        console.log(`\n🟠 [CANCEL_PENDING] ========== INÍCIO ==========`);
        console.log(`🟠 [CANCEL_PENDING] Medicamento ID: ${medicationId}`);
        console.log(`🟠 [CANCEL_PENDING] Usuário ID: ${userId}`);
        console.log(
            `🟠 [CANCEL_PENDING] Timestamp: ${timezone.now().toISOString()}`,
        );

        const medication = await models.Medication.findOne({
            where: {
                id: medicationId,
                userid: userId,
            },
        });

        if (!medication) {
            console.log(`🟠 [CANCEL_PENDING] Medicamento NÃO encontrado!`);
            throw new Error('Medicamento não encontrado');
        }

        console.log(
            `🟠 [CANCEL_PENDING] Medicamento encontrado: ${medication.name}`,
        );
        console.log(`🟠 [CANCEL_PENDING] Estado ANTES do cancelamento:`);
        console.log(`   - status: ${medication.status}`);
        console.log(
            `   - pendingconfirmation: ${medication.pendingconfirmation}`,
        );
        console.log(`   - pendinguntil: ${medication.pendinguntil}`);

        await medication.update({
            status: false,
            pendingconfirmation: false,
            pendinguntil: null,
        });

        console.log(`🟢 [CANCEL_PENDING] Medicamento APÓS cancelamento:`);
        console.log(`   - status: false`);
        console.log(`   - pendingconfirmation: false`);
        console.log(`   - pendinguntil: null`);
        console.log(
            `   - hournextdose: ${medication.hournextdose} (NÃO ALTERADO)`,
        );
        console.log(`🟠 [CANCEL_PENDING] ========== FIM ==========\n`);

        return {
            message: 'Confirmação cancelada',
            medication: {
                id: medication.id,
                name: medication.name,
                status: false,
                hournextdose: medication.hournextdose,
            },
        };
    }

    static async updateMedication(userId, medicationId, data) {
        const { name, hournextdose, periodstart, periodend, intervalinhours } =
            data;

        const medication = await models.Medication.findOne({
            where: { id: medicationId, userid: userId },
            include: [
                {
                    model: models.DoseIntervals,
                    as: 'doseinterval',
                    attributes: ['intervalinhours'],
                },
            ],
        });

        if (!medication) {
            return null;
        }

        const updates = {};

        if (name) updates.name = name.toLowerCase().trim();

        if (periodstart) {
            updates.periodstart = timezone.startOfDay(periodstart);
        }
        if (periodend) {
            updates.periodend = timezone.endOfDay(periodend);
        }

        if (hournextdose) {
            updates.hournextdose = hournextdose;
            console.log(
                `🕐 [UPDATE] Horário da dose atualizado para: ${hournextdose}`,
            );
        }

        if (intervalinhours) {
            console.log(
                `\n🔄 [UPDATE] Intervalo alterado: ${medication.doseinterval?.intervalinhours} → ${intervalinhours}`,
            );

            let doseInterval = await models.DoseIntervals.findOne({
                where: { intervalinhours },
            });

            if (!doseInterval) {
                doseInterval = await models.DoseIntervals.create({
                    intervalinhours,
                });
            }
            updates.doseintervalid = doseInterval.id;

            if (!hournextdose && medication.hournextdose) {
                const agora = timezone.now();
                const horaAtual = medication.hournextdose;

                console.log(
                    `🔄 [UPDATE] Recalculando horário baseado no intervalo...`,
                );
                console.log(`   - Horário atual: ${horaAtual}`);
                console.log(
                    `   - Intervalo antigo: ${medication.doseinterval?.intervalinhours}h`,
                );
                console.log(`   - Novo intervalo: ${intervalinhours}h`);

                const [horas, minutos] = horaAtual.split(':').map(Number);
                const horarioProgramado = new Date(agora);
                horarioProgramado.setHours(horas, minutos, 0, 0);

                console.log(
                    `   - Horário programado: ${horarioProgramado.toISOString()}`,
                );
                console.log(`   - Agora: ${agora.toISOString()}`);

                const diffMinutos =
                    (agora.getTime() - horarioProgramado.getTime()) /
                    (60 * 1000);
                const toleranciaMinutos = calcularTolerancia(intervalinhours);

                console.log(
                    `   - Diferença: ${Math.round(diffMinutos)} minutos`,
                );
                console.log(`   - Tolerância: ${toleranciaMinutos} minutos`);

                if (diffMinutos > toleranciaMinutos) {
                    console.log(`   ⚠️ Já passou da tolerância!`);

                    if (medication.lasttakentime) {
                        console.log(
                            `   - Última dose tomada: ${medication.lasttakentime}`,
                        );
                        const [ultimaHora, ultimoMinuto] =
                            medication.lasttakentime.split(':').map(Number);
                        horarioProgramado.setHours(
                            ultimaHora,
                            ultimoMinuto,
                            0,
                            0,
                        );
                    }

                    const novoHorario = this.calcularProximoHorario(
                        horaAtual,
                        intervalinhours,
                    );
                    updates.hournextdose = novoHorario;
                    console.log(
                        `   ✅ Próximo horário calculado (após tolerância): ${novoHorario}`,
                    );
                } else if (diffMinutos > 0) {
                    console.log(`   ✅ Dentro da tolerância!`);
                    const novoHorario = this.calcularProximoHorario(
                        horaAtual,
                        intervalinhours,
                    );
                    updates.hournextdose = novoHorario;
                    console.log(
                        `   ✅ Próximo horário calculado: ${novoHorario}`,
                    );
                } else {
                    console.log(
                        `   ⏩ Antes do horário - mantendo horário atual: ${horaAtual}`,
                    );
                    updates.hournextdose = horaAtual;
                }
            } else if (!hournextdose) {
                console.log(
                    `   ⚠️ Medicamento sem horário definido - pulando recálculo`,
                );
            }
        }

        console.log(`\n📝 [UPDATE] Aplicando atualizações:`, updates);
        await medication.update(updates);

        const updatedMedication = await models.Medication.findByPk(
            medicationId,
            {
                include: [
                    {
                        model: models.DoseIntervals,
                        as: 'doseinterval',
                        attributes: ['id', 'intervalinhours'],
                    },
                ],
            },
        );

        console.log(`✅ [UPDATE] Medicamento atualizado com sucesso!\n`);
        return updatedMedication;
    }

    static calcularProximoHorario(horaAtual, intervaloSegundos) {
        const [horas, minutos] = horaAtual.split(':').map(Number);
        const dataAtual = new Date();
        dataAtual.setHours(horas, minutos, 0, 0);

        const proximaData = new Date(
            dataAtual.getTime() + intervaloSegundos * 60 * 60 * 1000,
        );

        const proximaHora = proximaData.getHours().toString().padStart(2, '0');
        const proximoMinuto = proximaData
            .getMinutes()
            .toString()
            .padStart(2, '0');

        return `${proximaHora}:${proximoMinuto}`;
    }

    static async deleteMedication(userId, medicationId) {
        const medication = await models.Medication.findOne({
            where: { id: medicationId, userid: userId },
        });

        if (!medication) {
            return null;
        }

        const medicationName = medication.name;
        await medication.destroy();

        return { medicationName };
    }
}
