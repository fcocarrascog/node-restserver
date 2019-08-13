/*    PUERTO     */
process.env.PORT = process.env.PORT || 3000;


/* ENTORNO */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/* BASE DE DATOS */
let urlBD;
if (process.env.NODE_ENV === 'dev') {
    urlBD = 'mongodb://localhost:27017/cafe';
} else {
    urlBD = `mongodb+srv://srpanxio:IMQZfaSyzxhbUeEu@cluster0-bejxa.mongodb.net/cafe`
}

process.env.URLDB = urlBD;