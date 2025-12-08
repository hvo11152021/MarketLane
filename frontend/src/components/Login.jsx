import React, { useState } from 'react';
import API from '../axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/auth/login", {
        username,
        password,
      });

      const { token, username: name, role } = response.data;

      localStorage.setItem("token", token);
      if (name) localStorage.setItem("username", name);
      if (role) localStorage.setItem("role", role);

      window.dispatchEvent(new Event("authChanged"));
      navigate("/");
    } catch (error) {
      setError(error.response?.data ?? "Login failed");
    }
  };


  return (
    <div className="container" style={{ marginTop: 80, maxWidth: 480 }}>
      <div className="card p-3">
        <h4 className="mb-3">Login</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={submit}>
          <div className="mb-2">
            <label className="form-label">Username</label>
            <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
