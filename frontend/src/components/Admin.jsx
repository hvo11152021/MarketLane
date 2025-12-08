import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../axios";
import unplugged from "../assets/unplugged.png";

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "ROLE_USER" });
  const [error, setError] = useState("");

  // Fetch Admin Data
  const fetchData = async () => {
    try {
      const [usersRes, productsRes, analyticsRes] = await Promise.all([
        API.get("/admin/users"),
        API.get("/admin/products"),
        API.get("/admin/analytics"),
      ]);

      setUsers(usersRes.data || []);
      const backendProducts = productsRes.data || [];

      // Fetch product images and take care missing images
      const productsWithImages = await Promise.all(
        backendProducts.map(async (p) => {
          try {
            const resp = await API.get(`/product/${p.id}/image`, { responseType: "blob" });
            const imageUrl = URL.createObjectURL(resp.data);
            return { ...p, imageUrl };
          } catch {
            return { ...p, imageUrl: unplugged };
          }
        })
      );

      setProducts(productsWithImages);
      setAnalytics(analyticsRes.data || null);
    } catch (err) {
      setError(err.response?.data || "Failed to load admin data");
    }
  };

  //mount admin (go to admin page)
  useEffect(() => {
    // Redirect non-admin users
    if (localStorage.getItem("role") !== "ROLE_ADMIN") navigate("/");
    fetchData();

    // Cleanup object URLs for product images
    return () => {
      products.forEach((p) => {
        if (p?.imageUrl?.startsWith("blob:")) URL.revokeObjectURL(p.imageUrl);
      });
    };
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/users", newUser);
      setNewUser({ username: "", password: "", role: "ROLE_USER" });
      fetchData();
    } catch (err) {
      setError(err.response?.data || "Failed to create user");
    }
  };

  const deleteUser = async (id) => {
    const user = users.find((u) => u.id === id);
    const username = user?.username;
    if (!window.confirm(`Delete user ${username || id}? This cannot be undone.`)) return;

    try {
      await API.delete(`/admin/users/${id}`);
      fetchData();

      // Log out if the current user deleted themselves
      if (username && username === localStorage.getItem("username")) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        window.dispatchEvent(new Event("authChanged"));
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data || "Failed to delete user");
    }
  };

  
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;

    try {
      await API.delete(`/admin/products/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data || "Failed to delete product");
    }
  };

  return (
    <div className="container" style={{ marginTop: 80 }}>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card p-3">
            <h5>New User</h5>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={createUser}>
              <div className="mb-2">
                <input className="form-control" placeholder="username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
              </div>
              <div className="mb-2">
                <input type="password" className="form-control" placeholder="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div className="mb-2">
                <select className="form-select" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="ROLE_USER">User</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </div>
              <button className="btn btn-primary">Create</button>
            </form>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card p-3 mb-3">
            <h5>Analytics</h5>
            {analytics ? (
              <div className="d-flex gap-3">
                <div>Products: <strong>{analytics.productCount}</strong></div>
                <div>Total stock: <strong>{analytics.totalStock}</strong></div>
                <div>Avg price: <strong>${analytics.avgPrice.toFixed(2)}</strong></div>
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="card p-3 h-100">
                <h5>Users</h5>
                <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                  {users.length === 0 ? (
                    <div className="text-muted">No users</div>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {users.map(u => (
                        <li key={u.id} className="list-group-item d-flex align-items-center">
                          <div style={{ width: 42, height: 42, borderRadius: 8, background: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, fontWeight: 700 }}>
                            {u.username?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-grow-1">
                            <div style={{ fontWeight: 700 }}>{u.username}</div>
                            <div className="text-muted" style={{ fontSize: '.85rem' }}>{u.role}</div>
                          </div>
                          <div>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u.id)}>Delete</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card p-3 h-100">
                <h5>Products</h5>
                <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                  {products.length === 0 ? (
                    <div className="text-muted">No products</div>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {products.map(p => (
                        <li key={p.id} className="list-group-item d-flex align-items-center">
                          <img src={p.imageUrl || unplugged} alt={p.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, marginRight: 12 }} />
                          <div className="flex-grow-1">
                            <div style={{ fontWeight: 700 }}>{p.name}</div>
                            <div className="text-muted" style={{ fontSize: '.85rem' }}>{p.category || 'General'}</div>
                          </div>
                          <div style={{ textAlign: 'right', marginRight: 12 }}>${Number(p.price).toFixed(2)}</div>
                          <div>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteProduct(p.id)}>Delete</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
