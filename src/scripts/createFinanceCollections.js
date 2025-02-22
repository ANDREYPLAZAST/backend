require('dotenv').config();
const mongoose = require('mongoose');

async function createFinanceCollections() {
    try {
        // Usar la misma URL que en server.js
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/curso_app';
        
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        const db = mongoose.connection.db;

        // Eliminar colecciones existentes
        const collections = ['creditos', 'transacciones', 'suscripciones', 'balance'];
        for (const collection of collections) {
            try {
                await db.dropCollection(collection);
                console.log(`🗑️ Colección ${collection} eliminada`);
            } catch (e) {
                console.log(`ℹ️ La colección ${collection} no existía`);
            }
        }

        // Crear colección de créditos
        await db.createCollection("creditos", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["usuarioId", "montoSolicitado", "tasaInteres", "plazo"],
                    properties: {
                        usuarioId: { bsonType: "objectId" },
                        montoSolicitado: { bsonType: "number" },
                        tasaInteres: { bsonType: "number" },
                        plazo: { bsonType: "number" },
                        cuotaMensual: { bsonType: "number" },
                        fechaSolicitud: { bsonType: "date" },
                        fechaProximoPago: { bsonType: "date" },
                        estado: { enum: ["activo", "pagado", "atrasado"] },
                        pagosRealizados: { bsonType: "number" },
                        pagosTotales: { bsonType: "number" },
                        saldoPendiente: { bsonType: "number" }
                    }
                }
            }
        });
        console.log('✅ Colección creditos creada');

        // Crear colección de transacciones
        await db.createCollection("transacciones", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["usuarioId", "tipo", "monto"],
                    properties: {
                        usuarioId: { bsonType: "objectId" },
                        tipo: { enum: ["ingreso", "egreso", "transferencia"] },
                        categoria: { bsonType: "string" },
                        monto: { bsonType: "number" },
                        descripcion: { bsonType: "string" },
                        fecha: { bsonType: "date" },
                        estado: { enum: ["completada", "pendiente", "cancelada"] }
                    }
                }
            }
        });
        console.log('✅ Colección transacciones creada');

        // Crear colección de suscripciones
        await db.createCollection("suscripciones", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["usuarioId", "servicio", "monto"],
                    properties: {
                        usuarioId: { bsonType: "objectId" },
                        servicio: { bsonType: "string" },
                        monto: { bsonType: "number" },
                        frecuencia: { enum: ["mensual", "anual"] },
                        fechaInicio: { bsonType: "date" },
                        fechaProximoPago: { bsonType: "date" },
                        estado: { enum: ["activa", "cancelada"] },
                        metodoPago: { bsonType: "string" }
                    }
                }
            }
        });
        console.log('✅ Colección suscripciones creada');

        // Crear colección de balance
        await db.createCollection("balance", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["usuarioId", "saldoTotal"],
                    properties: {
                        usuarioId: { bsonType: "objectId" },
                        saldoTotal: { bsonType: "number" },
                        ultimaActualizacion: { bsonType: "date" },
                        historial: {
                            bsonType: "array",
                            items: {
                                bsonType: "object",
                                properties: {
                                    fecha: { bsonType: "date" },
                                    tipo: { enum: ["ingreso", "egreso"] },
                                    monto: { bsonType: "number" },
                                    saldoResultante: { bsonType: "number" }
                                }
                            }
                        }
                    }
                }
            }
        });
        console.log('✅ Colección balance creada');

        // Crear índices
        await db.collection('creditos').createIndex({ "usuarioId": 1 });
        await db.collection('transacciones').createIndex({ "usuarioId": 1 });
        await db.collection('transacciones').createIndex({ "fecha": 1 });
        await db.collection('suscripciones').createIndex({ "usuarioId": 1 });
        await db.collection('balance').createIndex({ "usuarioId": 1 }, { unique: true });
        console.log('✅ Índices creados');

        // Obtener el ID del usuario existente
        const usuario = await db.collection('users').findOne({ email: "andreyplazas77@gmail.com" });
        
        if (usuario) {
            // Crear datos de ejemplo
            await db.collection('balance').insertOne({
                usuarioId: usuario._id,
                saldoTotal: 2000000,
                ultimaActualizacion: new Date(),
                historial: [{
                    fecha: new Date(),
                    tipo: "ingreso",
                    monto: 2000000,
                    saldoResultante: 2000000
                }]
            });
            console.log('✅ Datos de ejemplo creados');
        }

        console.log('✅ Proceso completado exitosamente');

    } catch (error) {
        console.error('❌ Error al crear colecciones:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Conexión cerrada');
    }
}

createFinanceCollections(); 