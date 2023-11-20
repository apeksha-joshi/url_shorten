import { findUserByEmail, validateUserLogin, createUser, handleForgotPassword, updateResetPassword, UpdateUser } from '../dbServices/userServices.js'
import { getAuthToken, verifyResetToken } from '../middleware/auth.js';
import { findDefaultTier, findById } from '../dbServices/tierServices.js';
import customError from '../config/ApiCallError.js';
import passwordValidator from 'password-validator';
import validator from 'validator';
import jwt from 'jsonwebtoken';

const registerUser = async (req, res, next) => {

    try {
        const payload = req.body;

        if (!payload.email || !payload.firstName || !payload.lastName || !payload.password) {
            next(new customError("Missing required parameters. Expected firstName, lastName, email, password, tier(optional)", 400, 'warn'));
        }
        else {
            // validate email and password

            // email validation
            if (!validateEmail(payload.email)) {
                return next(new customError("Invalid email. Please provide a valid email", 400, 'warn'));
            }

            // password validation
            const isPasswordValid = validatePassword(payload.password);
            if (!isPasswordValid.valid) {
                return next(new customError(isPasswordValid.message, 400, 'warn'));
            }

            let existingUser;
            try {
                existingUser = await findUserByEmail(payload.email);
            } catch (error) {
                console.log("No user registered with this email");
            }

            if (existingUser) {
                next(new customError("Email address is already registered", 400, 'warn'));
            } else {
                try {
                    payload.lastLoginDate = new Date();
                    if (!payload.tier) {
                        const defaultTier = await findDefaultTier();
                        if (!defaultTier) {
                            next(new customError("Failed to find default Tier value", 500, 'error'));
                        }
                        payload.tier = defaultTier;
                    } else {
                        try {
                            //validate if given tier is correct
                            const tier = await findById(payload.tier);
                        } catch (error) {
                            next(new customError("Invalid Teir id", 400, 'warn'));
                        }

                    }


                    const newUser = await createUser(payload);
                    req.body.user = newUser;
                    const tokens = await getAuthToken(req, res);

                    res.cookie('jwt', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
                    res.status(200).json({ id: newUser._id.toString(), email: newUser.email, accessToken: tokens.accessToken });
                } catch (error) {
                    if (newUser) {
                        await deleteUser(newUser._id);
                    }
                    next(new customError("Internal server error", 500, 'error'));
                }

            }
        }
    }
    catch (error) {
        next(new customError("Internal server error", 500, 'error'));
    }

}

const loginUser = async (req, res, next) => {
    try {
        const payload = req.body;
        if (!payload.email || !payload.password) {
            next(new customError("Missing required parameters. Expected email and password", 400, 'warn'));
        } else {
            const userData = await validateUserLogin(payload);
            if (userData === false) {
                next(new customError("Invalid email/password", 401, 'warn'));
            } else {
                const prevLastLoginDate = userData.lastLoginDate;
                const currentDateTime = new Date();
                const currDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());
                const lastLoginDate = new Date(userData.lastLoginDate.getFullYear(), userData.lastLoginDate.getMonth(), userData.lastLoginDate.getDate());
                if (!userData.lastLoginDate || currDate.toDateString() !== lastLoginDate.toDateString()) {
                    userData.requestCount = 0;
                    userData.lastLoginDate = new Date();
                    await UpdateUser(userData);
                }


                try {
                    req.body.user = userData;
                    const tokens = await getAuthToken(req, res);
                    res.cookie('jwt', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
                    res.status(200).json({ id: newUser._id.toString(), email: userData.email, accessToken: tokens.accessToken });
                } catch (error) {
                    userData.lastLoginDate = prevLastLoginDate;
                    await UpdateUser(userData);
                    next(new customError("Internal server error", 500, 'error'));
                }

            }

        }
    } catch (error) {
        next(new customError("Internal server error", 500, 'error'));
    }
}

const handleRefreshToken = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) {
            next(new customError("Refresh token missing", 400, 'warn'));
        } else {
            const refreshToken = cookies.jwt;
            let refreshTokenDecoded;
            try {
                refreshTokenDecoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
            } catch (error) {
                return next(new customError("Invalid refresh token", 401, 'warn'))
            }


            // if decoded check agaisnt users refresh token
            const user = await findUserByEmail(refreshTokenDecoded.email);
            if (user.refreshToken !== refreshToken) {
                return next(new customError("Invalid refresh Token for the user", 401, 'warn'));
            }
            req.body.user = user;
            // generate new tokens
            const tokens = await getAuthToken(req, res);
            res.cookie('jwt', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
            res.status(200).json({ email: user.email, accessToken: tokens.accessToken });
        }
    } catch (error) {
        next(new customError("Internal server error", 500, 'error'));
    }
};


const initiateForgotPassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        if (!email) {
            next(new customError("Missing required parameters", 400, 'warn'));
        } else {
            let existingUser;
            try {
                existingUser = await findUserByEmail(email);
            } catch (error) {
                console.log("No user registered with this email");
            }

            if (!existingUser) {
                next(new customError("Invalid email", 401, 'warn'));
            } else {
                const resetToken = await handleForgotPassword(email);
                if (resetToken) {
                    // send reset link as well via email
                    res.status(200).json({ resetToken: resetToken });
                } else {
                    next(new customError("Failed to reset refreshToken due to internal error", 500, 'error'));
                }
            }

        }
    } catch (error) {
        next(new customError("Internal server error", 500, 'error'));
    }
}


const resetPassword = async (req, res, next) => {
    try {
        const { resetToken, password } = req.body;
        if (!resetToken || !password) {
            next(new customError("Missing required parameters", 400, 'warn'));
        }
        else {
            const email = await verifyResetToken(resetToken);

            if (email && typeof email === 'string') {
                // validate password 
                const isPasswordValid = validatePassword(payload.password);
                if (!isPasswordValid.valid) {
                    return next(new customError(isPasswordValid.message, 400, 'warn'));
                }
                const isReset = await updateResetPassword(password, email);

                if (isReset) {
                    res.status(200).json({ message: "Reset successful" });
                } else {
                    next(new customError("Failed to reset password due to internal error", 500, 'error'));
                }

            } else {
                next(new customError("Invalid ResetToken", 401, 'warn'));
            }
        }
    } catch (error) {
        next(new customError("Internal server error", 500, 'error'));
    }
}

const handleLogout = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) {
            return res.status(200).send({ message: "User was successfully logged out" });
        }
        const refreshToken = cookies.jwt;
        // check if it is the correct token

        const refreshTokenDecoded = jwt.verify(refreshToken, JWT_SECRET);
        if (!refreshTokenDecoded) {
            return next(new customError("Invalid refresh token", 401, 'warn'));
        }

        // if decoded check agaisnt users refresh token
        const user = await findUserByEmail(refreshTokenDecoded.email);
        if (user.refreshToken !== refreshToken) {
            return next(new customError("Invalid refresh Token", 403, 'warn'));
        }

        // remove refreshToken from user
        user.refreshToken = '';
        await UpdateUser(user);

        // clear cookie
        res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
        res.status(200).json({ message: "User was successfully logged out" });

    } catch (error) {
        next(new customError("Internal server error", 500, 'error'));
    }
}

const validateEmail = (email) => {
    if (validator.isEmail(email)) {
        console.log('Email is valid');
        return true;
    } else {
        console.log('Email is invalid');
        return false;
    }
};

const createPasswordValidator = () => {
    const schema = new passwordValidator();

    schema
        .is().min(8) // Minimum length 8
        .has().uppercase() // Must have uppercase letters
        .has().digits() // Must have at least one digit
        .has().symbols(); // Must have at least one symbol

    return schema;
};

const validatePassword = (inputPassword) => {
    const passwordValidatorInstance = createPasswordValidator();
    const validationResult = passwordValidatorInstance.validate(inputPassword, { list: true });
    //console.log("After validation", validationResult);
  if (validationResult.length === 0) {
    return { valid: true };
  } else {
    //${validationResult.join(', ')}
    const errorMessage = `Password does not meet the requirements. It should have atleast one ${validationResult.join(', ')}`;
    console.log(errorMessage);
    return { valid: false, message: errorMessage };
  }
}


export default {
    registerUser,
    loginUser,
    initiateForgotPassword,
    resetPassword,
    handleRefreshToken,
    handleLogout,
};