import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js'; // Importación corregida

const router = express.Router();

// REGISTRO
router.post('/register', async (req, res) => {
  try {
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).json({ message: 'El correo ya existe' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });

    const savedUser = await user.save();
    res.json({ user: savedUser._id, name: savedUser.name });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ message: 'Correo o contraseña incorrectos' });

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).json({ message: 'Correo o contraseña incorrectos' });

    res.json({ user: user._id, name: user.name, email: user.email });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;