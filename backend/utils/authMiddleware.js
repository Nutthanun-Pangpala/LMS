const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized to access this route' });
        console.warn('Authorization failed: No token provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token is invalid' });
        console.error('Token verification failed:', err);
    }
};
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `User role ${req.user.role} is not authorized to access this action` 
            });
        }
        next();
    };
};

exports.restrictToTenant = (req, res, next) => {
    if (req.user.role === 'Viewer') {
        req.query.tenant = req.user.tenant_id;
    }
    next();
};