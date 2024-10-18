export const store_token = (token_name, token, max_age, res) => {
    res.cookie(token_name, token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: max_age
    })
}