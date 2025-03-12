import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password.length < 8) {
            alert('Mật khẩu phải có ít nhất 8 ký tự.');
            return;
        }

        if (password !== confirmPassword) {
            alert("Mật khẩu và xác nhận mật khẩu không khớp!");
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/auth/register', { email, name, password });
            alert('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
            setEmail('');
            setName('');
            setPassword('');
            setConfirmPassword(''); 
        } catch (error) {
            console.error(error);
            alert('Lỗi');
        }
    };

    return (
        <div className='logreg-screen'>
            <h1>Đăng ký</h1>
            <form onSubmit={handleSubmit} style={{ width: '500px' }}>
                <div>
                    <label>Tên đăng nhập:</label>
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>Tên:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label>Mật khẩu:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div>
                    <label>Xác nhận mật khẩu:</label> 
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <button type="submit">Đăng ký</button>
            </form>
        </div>
    );
};

export default Register;
