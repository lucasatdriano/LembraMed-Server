export function calcularTolerancia(intervaloHoras) {
    const intervaloMinutos = intervaloHoras * 60;
    // Tolerância = 25% do intervalo (1/4)
    const toleranciaMinutos = Math.floor(intervaloMinutos * 0.25);

    console.log(`⏱️ Intervalo: ${intervaloHoras}h (${intervaloMinutos}min)`);
    console.log(`⏱️ Tolerância: ${toleranciaMinutos}min (25% do intervalo)`);
    return toleranciaMinutos;
}

/**
 * Verifica se faltam 2 horas ou mais para a próxima dose
 * @param {Object} medication - Medicamento
 * @param {Date} agora - Data atual
 * @returns {Object} Resultado da validação
 */
export function verificarIntervaloMinimo(medication, agora) {
    if (!medication.lasttakentime) {
        return { valido: true };
    }

    console.log(
        `\n⏰ [VERIFICAR_INTERVALO] ========== VERIFICANDO INTERVALO MÍNIMO ==========`,
    );

    const [ultimaHora, ultimoMinuto] = medication.lasttakentime
        .split(':')
        .map(Number);
    const dataUltimaDose = new Date(agora);
    dataUltimaDose.setHours(ultimaHora, ultimoMinuto, 0, 0);

    if (dataUltimaDose > agora) {
        dataUltimaDose.setDate(dataUltimaDose.getDate() - 1);
        console.log(
            `⏰ [VERIFICAR_INTERVALO] Última dose ajustada para o dia anterior`,
        );
    }

    const proximoHorarioPermitido = new Date(
        dataUltimaDose.getTime() + 2 * 60 * 60 * 1000,
    );

    const diffMinutosAtePermitido =
        (proximoHorarioPermitido.getTime() - agora.getTime()) / (60 * 1000);

    console.log(
        `⏰ [VERIFICAR_INTERVALO] Última dose: ${medication.lasttakentime} (${dataUltimaDose.toLocaleString()})`,
    );
    console.log(
        `⏰ [VERIFICAR_INTERVALO] Próximo horário permitido: ${proximoHorarioPermitido.toLocaleString()}`,
    );
    console.log(`⏰ [VERIFICAR_INTERVALO] Agora: ${agora.toLocaleString()}`);
    console.log(
        `⏰ [VERIFICAR_INTERVALO] Minutos até poder tomar: ${Math.round(diffMinutosAtePermitido)}`,
    );

    if (diffMinutosAtePermitido > 2 * 60) {
        const horasRestantes = Math.floor(diffMinutosAtePermitido / 60);
        const minutosRestantes = Math.floor(diffMinutosAtePermitido % 60);

        let mensagem = `⏳ Faltam ${horasRestantes} hora${horasRestantes > 1 ? 's' : ''}`;
        if (minutosRestantes > 0) {
            mensagem += ` e ${minutosRestantes} minuto${minutosRestantes > 1 ? 's' : ''}`;
        }
        mensagem += ` para a próxima dose. O intervalo mínimo é de 2 horas.`;

        console.log(
            `⏰ [VERIFICAR_INTERVALO] ❌ FALTAM 2 HORAS OU MAIS - NÃO PODE TOMAR`,
        );
        console.log(`⏰ [VERIFICAR_INTERVALO] Mensagem: ${mensagem}`);

        return {
            valido: false,
            mensagem,
            detalhes: {
                faltamMinutos: Math.round(diffMinutosAtePermitido),
                faltamHoras: horasRestantes,
                faltamMinutosRestantes: minutosRestantes,
                ultimaDose: medication.lasttakentime,
                proximoHorarioPermitido: proximoHorarioPermitido.toISOString(),
            },
        };
    }

    console.log(`⏰ [VERIFICAR_INTERVALO] ✅ Intervalo mínimo respeitado`);
    console.log(`⏰ [VERIFICAR_INTERVALO] ========== FIM ==========\n`);

    return { valido: true };
}
