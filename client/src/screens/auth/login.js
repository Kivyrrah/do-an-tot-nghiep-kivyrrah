import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                alert('Đăng nhập không thành công');
            }
            else {
                const data = await response.json();
                const token = data.token;
                const email = data.email;
                const isAdmin = data.isAdmin;
                localStorage.setItem('token', token);
                localStorage.setItem('email', email);
                localStorage.setItem('isAdmin', isAdmin);
                alert(`Đăng nhập thành công! ${token}`);
                onLogin(); 
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="logreg-screen">
            <h1>Đăng Nhập</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ width: '500px', height: '250px' }} >
                <label>Tên đăng nhập:</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required /> 
                {/*Em không xử lý được xác thực email nên đổi cho nó làm username*/}
                <label>Mật khẩu:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Đăng Nhập</button>
            </form>
        </div>
    );
};

export default Login;
