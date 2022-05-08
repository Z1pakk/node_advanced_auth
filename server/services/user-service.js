const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('../services/mail-service')
const tokenService = require('../services/token-service')
const UserDTO = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email});
        if (candidate) {
            throw ApiError.BadRequest(`User with this email ${email} is already exists`);
        }
        const hashPassword = await bcrypt.hash(password.toString(), 3);
        const activationLink = uuid.v4();

        const user = await UserModel.create({email, password: hashPassword, activationLink});
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDTO = new UserDTO(user);
        const tokens = tokenService.generateTokens({...userDTO})
        await tokenService.saveToken(userDTO.id, tokens.refreshToken);

        return {...tokens, user: userDTO}
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink});
        if (!user) {
            throw ApiError.BadRequest("Invitation link is incorrect");
        }
        user.isActivated = true;
        await user.save();
    }
}

module.exports = new UserService();
