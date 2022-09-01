const { validationResult } = require("express-validator");

// Recopila ERRORS de validadores y los retorna en JSON

const fieldsValidators = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json(errors)
    }
     
    next();
}


module.exports = {
    fieldsValidators,
}