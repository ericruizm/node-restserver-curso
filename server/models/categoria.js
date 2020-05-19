const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        required: [true, "La descripción es necesaria"],
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
    },
});

categoriaSchema.methods.toJSON = function() {
    let categoria = this;
    let categoriaObject = categoria.toObject();
    delete categoriaObject.password;

    return categoriaObject;
};

categoriaSchema.plugin(uniqueValidator, {
    message: "{PATH} debe de ser unico",
});

module.exports = mongoose.model("Categoria", categoriaSchema);