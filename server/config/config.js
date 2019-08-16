/*    PUERTO     */
process.env.PORT = process.env.PORT || 3000;

/* ENTORNO */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/* VENCIMIENTO TOKEN || Segundos - Minutos - Horas - Días */
process.env.CADUCIDAD_TOKEN = "30 days";

/* SEMILLA DE AUTENTICACION */
process.env.SEED = process.env.SEED || 'esta-es-la-semilla-de-desarrollo';

/* BASE DE DATOS */
let urlBD;
if (process.env.NODE_ENV === 'dev') {
    urlBD = 'mongodb://localhost:27017/cafe';
} else {
    urlBD = process.env.MONGO_URI;
}

process.env.URLDB = urlBD;