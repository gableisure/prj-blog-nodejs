module.exports = {
    ehAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.ehAdmin == 1) return next();
        req.flash("error_msg", "Restrito para administradores");
        res.redirect("/");
    }
}