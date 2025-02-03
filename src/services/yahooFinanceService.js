const yahooFinance = require('yahoo-finance2').default;

async function obtenerDatosFondo(fondoTicker) {
    try {
        const datos = await yahooFinance.quote(fondoTicker);
        return {
            nombre: datos.shortName,
            precio: datos.regularMarketPrice,
            variacion: datos.regularMarketChangePercent,
            volumen: datos.regularMarketVolume,
            apertura: datos.regularMarketOpen,
            maximo: datos.regularMarketDayHigh,
            minimo: datos.regularMarketDayLow
        };
    } catch (error) {
        throw error;
    }
}

module.exports = { obtenerDatosFondo }; 