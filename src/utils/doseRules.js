export function calcularTolerancia(intervaloHoras) {
    const intervaloMinutos = intervaloHoras * 60;
    // Tolerância = 25% do intervalo (1/4)
    const toleranciaMinutos = Math.floor(intervaloMinutos * 0.25);

    console.log(`⏱️ Intervalo: ${intervaloHoras}h (${intervaloMinutos}min)`);
    console.log(`⏱️ Tolerância: ${toleranciaMinutos}min (25% do intervalo)`);
    return toleranciaMinutos;
}
