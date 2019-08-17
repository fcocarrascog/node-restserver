const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

var categoriaSchema = new Schema({
    descripcion: { type: String, unique: true, required: [true, 'La descripcion es requerida'] },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }
});

categoriaSchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser unica'
});



module.exports = mongoose.model('Categoria', categoriaSchema);