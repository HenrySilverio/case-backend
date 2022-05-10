const User = require('../models/UserModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class UserController {
    static async register(req, res) {

        const { name, email, password, confirmPassword } = req.body

        // validations
        if (!name) {
            res.status(422).json({ msg: 'O nome e obrigatorio!' })
            return
        }
        if (!email) {
            res.status(422).json({ msg: 'O email e obrigatorio!' })
            return
        }
        if (!password) {
            res.status(422).json({ msg: 'O senha e obrigatoria!' })
            return
        }
        if (!confirmPassword) {
            res.status(422).json({ msg: 'O obrigatorio confirmar senha!' })
            return
        }
        if (password !== confirmPassword) {
            res.status(422).json({ msg: 'As senhas nao conferem!' })
            return
        }

        // check if user exists
        const userExists = await User.findOne({ email: email })

        if (userExists) {
            res.status(422).json({ msg: 'Por favor Utilize outro e-mail' })
            return
        }

        // create password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        // create user
        const user = new User({
            name: name,
            email: email,
            password: passwordHash,
        })

        try {
            const newUser = await user.save()

            await createUserToken(newUser, req, res)
        } catch (error) {
            res.status(500), json({ msg: error })
        }
    }

    static async login(req, res) {

        const { email, password } = req.body

        if (!email) {
            res.status(422).json({ message: 'O e-mail é obrigatório!' })
            return
        }

        if (!password) {
            res.status(422).json({ message: 'A senha é obrigatória!' })
            return
        }

        // check if user exists
        const user = await User.findOne({ email: email })

        if (!user) {
            return res.status(422).json({ message: 'Não há usuário cadastrado com este e-mail!' })
        }
        // check if password match
        const checkPassword = await bcrypt.compare(password, user.password)

        if (!checkPassword) {
            return res.status(422).json({ message: 'Senha inválida' })
        }

        await createUserToken(user, req, res)
    }

    static async checkUser(req, res) {
        let currentUser

        if (req.headers.authorization) {
            const token = getToken(req)
            const decoded = jwt.verify(token, 'nossosecret')

            currentUser = await User.findById(decoded.id)

            currentUser.password = undefined
        } else {
            currentUser = null
        }

        res.status(200).send(currentUser)
    }

    static async getUserById(req, res) {
        const id = req.params.id

        const user = await User.findById(id).select("-password")

        if (!user) {
            res.status(422).json({ message: 'Usuário não encontrado!' })
            return
        }

        res.status(200).json({ user })
    }

    static async editUser(req, res) {
        const id = req.params.id

        // check if user exists
        const token = getToken(req)
        const user = await getUserByToken(token)

        const { name, email, password, confirmpassword } = req.body

        // validations
        if (!name) {
            res.status(422).json({ msg: 'O nome e obrigatorio!' })
            return
        }
        if (!email) {
            res.status(422).json({ msg: 'O email e obrigatorio!' })
            return
        }

        // check if email has already taken
        const userExists = await User.findOne({ email: email })

        if (!user.email !== email && userExists) {
            res.status(422).json({ message: 'Por favor, utilize outro e-mail!' })
            return
        }

        user.email = email

        if (password !== confirmpassword) {
            res.status(422).json({ msg: 'As senhas nao conferem!' })
            return
        } else if (password === confirmpassword && password != null) {


            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            user.password = passwordHash
        }

        try {
            //return user updated data
            await User.findByIdAndUpdate(
                { _id: user._id },
                { $set: user },
                { new: true },
            )
            res.status(200).json({ msg: 'Usuário atualizado com sucesso!' })

        } catch (err) {
            res.status(500).json({ msg: err })
        }
    }
}
