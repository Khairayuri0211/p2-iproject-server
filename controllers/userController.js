"use strict"

const { compareHashWithPass, createToken } = require("../helpers/helper")
const { User } = require("../models/index")
const { OAuth2Client } = require('google-auth-library');

class Controller {
    static async listUser(req, res, next) {
        try {
            const findUser = await User.findAll({
                attributes: {exclude: ["password","createdAt","updatedAt"]},
                order: [['id','ASC']]
            });
            res.status(200).json({
                statusCode: 200,
                data: findUser
            });

        } catch (err) {
            next(err);
        }
    }

    static async register(req, res, next) {
        try {
            const { nickname, email, password } = req.body
            const newUser = await User.create({
                nickname,
                email,
                password,
            });

            if (!newUser) {
                throw new Error("REGISTRATION_FAILED")
            }

            res.status(201).json({
                statusCode: 201,
                message: "Succes created user",
                data: {
                    id: newUser.id,
                    nickname: newUser.username,
                    email: newUser.email,
                }
            })
        } catch (err) {
            next(err)
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body

            const foundUser = await User.findOne({
                where: {
                    email
                }
            });

            if (!foundUser) {
                throw new Error("USER_NOT_FOUND")
            }

            const correctPassword = compareHashWithPass(password, foundUser.password)

            if (!correctPassword) {
                throw new Error("INVALID_PASSWORD")
            }

            //bikin payload dulu
            const payload = {
                id: foundUser.id,
                nickname: foundUser.nickname,
                email: foundUser.email 
            }

            const access_token = createToken(payload);

            res.status(200).json({
                statusCode: 200,
                message: "Succes Login",
                access_token: access_token,
                payload
            })

        } catch (err) {
            next(err)
        }
    }

    // static async loginGoogle(req, res, next) {
    //     try {
    //         const client = new OAuth2Client(process.env.client_id);
    //         const ticket = await client.verifyIdToken({
    //             idToken: req.body.credential,
    //             audience: process.env.client_id,
    //         });
    //         const payload = ticket.getPayload();
    //         const user = await User.findOrCreate({
    //             where: { email: payload.email },
    //             defaults: {
    //                 nickname: 'userGoogle',
    //                 password: "123456",
    //             }
    //         })

    //         console.log(user, "ini user");
    //         const dataUser = {
    //             id: +user.id,
    //             email: user.email,
    //         }

    //         const access_token = createToken(dataUser)

    //         res.status(200).json({
    //             statusCode: 200,
    //             message: "Login Google Succes",
    //             access_token,
    //             dataUser
    //         })

    //     } catch (err) {
    //         next(err)
    //     }
    // }
}

module.exports = Controller 