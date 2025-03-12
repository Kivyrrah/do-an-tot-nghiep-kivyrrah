const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');
const Favorite = require('../models/FavoriteSchema');
const router = express.Router();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
}

router.post('/register', async (req, res) => {
    const { email, name, password } = req.body;
    try {
        console.log('Email:', email);
        console.log('Tên:', name);
        console.log('Mật khẩu:', password);
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, name, password: hashedPassword });
        await newUser.save();
        res.status(201).send('Đăng ký thành công');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('Địa chỉ email này chưa được đăng ký');
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Không hợp lệ');
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const isAdmin = user.isAdmin; 

        res.json({ token, email, isAdmin });
    } catch (error) {
        res.status(500).send('Lỗi');
    }
});

router.get('/user-id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id; 
    res.json({ userId });
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(500).send('Lỗi khi lấy thông tin người dùng');
  }
});


router.put('/profile-edit', authenticateToken, async (req, res) => {
  const { name, password } = req.body; 

  const updatedUser = {};
  if (name) updatedUser.name = name; 
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10); 
    updatedUser.password = hashedPassword; 
  }

  try {
    const user = await User.findByIdAndUpdate(req.user.id, updatedUser, { new: true }).select('-password');
    if (!user) {
      return res.status(404).send('Người dùng không tồn tại');
    }
    res.json(user);
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(500).send('Lỗi khi sửa thông tin người dùng');
  }
});



router.delete('/delete-account', authenticateToken, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Mật khẩu không được để trống' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu không chính xác' });
    }

    await User.findByIdAndDelete(req.user.userId);
    await Favorite.deleteMany({ email: user.email });

    res.json({ message: 'Xóa tài khoản và danh sách nhạc thành công' });
  } catch (error) {
    console.error('Lỗi server:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
});

module.exports = router;
