const { readData, writeData } = require('./fileManager');

const registerUser = (req, res) => {
    const users = readData('users.json');
    const { name, email, password, address } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
    }

    const newUser = {
        id: 'USR-' + Date.now().toString(36),
        name,
        email: email.toLowerCase(),
        password,
        address: address || '',
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeData('users.json', users);

    const { password: _, ...userSession } = newUser;
    return res.status(201).json({ message: 'User registered successfully', user: userSession });
};

const loginUser = (req, res) => {
    const users = readData('users.json');
    const { email, password } = req.body;

    const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase() && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _, ...userSession } = user;
    return res.status(200).json({ message: 'Login successful', user: userSession });
};

module.exports = {
    registerUser,
    loginUser
};