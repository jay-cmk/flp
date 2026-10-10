const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();
    const userData = user.toObject();
    delete userData.password;

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user: userData,
        token,
    });
}

module.exports = sendToken;