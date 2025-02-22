const yahooFinance = require('yahoo-finance2').default;

const obtenerDatosFondo = async (fondoTicker) => {
    try {
        // Configuración básica
        const queryOptions = {
            modules: ['price', 'summaryDetail']  // Solo módulos necesarios
        };

        const datos = await yahooFinance.quote(fondoTicker, queryOptions);
        console.log('Datos recibidos:', datos);

        return {
            nombre: datos.shortName || datos.longName || 'N/A',
            precio: datos.regularMarketPrice || 0,
            variacion: datos.regularMarketChangePercent || 0,
            volumen: datos.regularMarketVolume || 0,
            apertura: datos.regularMarketOpen || 0,
            maximo: datos.regularMarketDayHigh || 0,
            minimo: datos.regularMarketDayLow || 0
        };
    } catch (error) {
        console.error('Error detallado:', error);
        throw new Error(`No se pudieron obtener los datos para ${fondoTicker}`);
    }
};

module.exports = { obtenerDatosFondo }; 