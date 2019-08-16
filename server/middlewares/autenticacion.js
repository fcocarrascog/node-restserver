const jwt = require('jsonwebtoken');


/* VERIFICA TOKEN*/
let verificaToken = (req, res, next) => {
    /* GET obtiene los headers */
    let token = req.get('Authorization');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
};

/* VERIFICA ADMIN_ROLE */
let verificaAdmin_role = (req, res, next) => {
    if (req.usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No tiene los privilegios necesarios para realizar esta acción.'
            }
        });
    }


}

module.exports = {
    verificaToken,
    verificaAdmin_role
}