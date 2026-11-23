const crypto = require('crypto');
const { readData, writeData } = require('./fileManager');

// Clave maestra de 256 bits (32 bytes) derivada mediante SHA-256 para AES-256-CBC
const AES_KEY = crypto.createHash('sha256').update('AEGIS_CONTROL_CCTV_SECRET_2026').digest();

// Genera un hash seguro de la contraseña con un salt aleatorio de 16 bytes
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
};

// Verifica la contraseña comparando el hash guardado contra el ingresado
const verifyPassword = (password, storedPassword) => {
    if (!storedPassword || !storedPassword.includes(':')) {
        return password === storedPassword; // Compatibilidad con usuarios previos en texto plano
    }
    const [salt, key] = storedPassword.split(':');
    const hashBuffer = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');
    return crypto.timingSafeEqual(hashBuffer, keyBuffer);
};

// Cifra texto (dirección) usando AES-256-CBC con IV aleatorio de 16 bytes
const encryptText = (text) => {
    if (!text) return '';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

// Descifra texto (dirección) cifrado con AES-256-CBC
const decryptText = (encryptedData) => {
    if (!encryptedData || !encryptedData.includes(':')) {
        return encryptedData || ''; // Compatibilidad con direcciones previas sin cifrar
    }
    try {
        const [ivHex, encryptedHex] = encryptedData.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, iv);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        return '';
    }
};

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

    const plainAddress = address || '';

    const newUser = {
        id: 'USR-' + Date.now().toString(36),
        name,
        email: email.toLowerCase(),
        password: hashPassword(password),
        address: encryptText(plainAddress),
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeData('users.json', users);

    // Devolvemos al frontend la sesión sin contraseña y con la dirección descifrada
    const { password: _, ...userSession } = newUser;
    userSession.address = plainAddress;

    return res.status(201).json({ message: 'User registered successfully', user: userSession });
};

const loginUser = (req, res) => {
    const users = readData('users.json');
    const { email, password } = req.body;

    const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user || !verifyPassword(password || '', user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Devolvemos al frontend la sesión sin contraseña y con la dirección descifrada
    const { password: _, ...userSession } = user;
    userSession.address = decryptText(user.address);

    return res.status(200).json({ message: 'Login successful', user: userSession });
};

module.exports = {
    registerUser,
    loginUser
};