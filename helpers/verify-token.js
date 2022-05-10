const jwt = require('jsonwebtoken')
const getToken = require('./get-token')

const checkToken = (req, res, next) => {

    if (!req.headers.authorization) {
        return res.status(401).json({msg: 'Acesso Negado!'})
    }

    const token = getToken(req)

    if (!token) {
        return res.status(401).json({msg: 'Acesso Negado!'})
    }

    try {

        const verify = jwt.verify(token, 'nossosecret')
        req.user = verify
        next()

    } catch (err) {
        return res.status(400).json({msg: 'Token inválido'})
    }
}

module.exports = checkToken