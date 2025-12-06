import React, { useEffect, useState, useContext } from "react";
import Home from "./Home";
import API from "../axios";
import AppContext from "../Context/Context";
import { useNavigate } from "react-router-dom";
// import { json } from "react-router-dom";
// import { BiSunFill, BiMoon } from "react-icons/bi";

const Navbar = ({ onSelectCategory, onSearch }) => {
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme ? storedTheme : "light-theme";
  };
  const [selectedCategory, setSelectedCategory] = useState("");
  const [theme, setTheme] = useState(getInitialTheme());
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false)
  const { refreshData } = useContext(AppContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || '');

  useEffect(() => {
    const onStorage = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
      setUsername(localStorage.getItem('username') || '');
      setRole(localStorage.getItem('role') || '');
    };
    const onAuthChanged = () => onStorage();
    window.addEventListener('storage', onStorage);
    window.addEventListener('authChanged', onAuthChanged);
    // preload search list
    (async () => {
      try {
        const response = await API.get("/products");
        setSearchResults(response.data || []);
      } catch (err) {
        console.error("Error fetching products for search:", err);
      }
    })();
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('authChanged', onAuthChanged);
    };
  }, []);

  const handleChange = async (value) => {
    setInput(value);
      if (value.length >= 1) {
      setShowSearchResults(true)
      try {
        const response = await API.get(`/products/search?keyword=${encodeURIComponent(value)}`);
        setSearchResults(response.data);
        setNoResults(response.data.length === 0);
        console.log(response.data);
      } catch (error) {
        console.error("Error searching:", error);
      }
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
      setNoResults(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    onSelectCategory(category);
    try {
      // fetch filtered products from backend via context
      refreshData(category);
    } catch (err) {
      console.error("Error refreshing data by category:", err);
    }
    // navigate to home so user sees filtered results
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUsername('');
    // notify same-tab listeners
    window.dispatchEvent(new Event('authChanged'));
    // refresh product list as anonymous
    refreshData();
    navigate('/');
  }

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const categories = [
    "Laptop",
    "Headphone",
    "Mobile",
    "Electronics",
    "Toys",
    "Fashion",
  ];
  return (
    <>
      <header>
        <nav className="navbar navbar-expand-lg fixed-top">
          <div className="container-fluid">
            <a className="navbar-brand">MarketLane</a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a className="nav-link active" aria-current="page" href="/">
                    Home
                  </a>
                </li>
                {role === 'ROLE_ADMIN' && (
                  <li className="nav-item">
                    <a className="nav-link" href="/add_product">
                      Add Product
                    </a>
                  </li>
                )}
                {role === 'ROLE_ADMIN' && (
                  <li className="nav-item">
                    <a className="nav-link" href="/admin">Admin</a>
                  </li>
                )}

                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="/"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Categories
                  </a>

                  <ul className="dropdown-menu">
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleCategorySelect("")}
                      >
                        All Categories
                      </button>
                    </li>
                    {categories.map((category) => (
                      <li key={category}>
                        <button
                          className="dropdown-item"
                          onClick={() => handleCategorySelect(category)}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>

                <li className="nav-item"></li>
              </ul>
              <div className="d-flex align-items-center cart">
                <a href="/cart" className="nav-link text-dark d-flex align-items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="me-1" aria-hidden="true">
                    <path d="M6 6h15l-1.5 9h-11z" />
                    <circle cx="10" cy="20" r="1" />
                    <circle cx="18" cy="20" r="1" />
                  </svg>
                  <span>Cart</span>
                </a>
                {isAuthenticated ? (
                  <>
                    <span className="nav-link d-flex align-items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="me-1" aria-hidden="true">
                        <circle cx="12" cy="8" r="3" />
                        <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                      </svg>
                      {username}
                    </span>
                    {role === 'ROLE_ADMIN' && (
                      <a className="nav-link d-flex align-items-center" href="/admin">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="me-1" aria-hidden="true">
                          <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
                        </svg>
                        Admin
                      </a>
                    )}
                    <button className="btn btn-link nav-link d-flex align-items-center" onClick={handleLogout}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="me-1" aria-hidden="true">
                        <rect x="3" y="7" width="13" height="10" rx="2" ry="2" />
                        <path d="M16 12h6" />
                        <path d="M19 9l3 3-3 3" />
                      </svg>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <a className="nav-link d-flex align-items-center" href="/login">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="me-1" aria-hidden="true">
                        <circle cx="12" cy="8" r="3" />
                        <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                      </svg>
                      Login
                    </a>
                    <a className="nav-link d-flex align-items-center" href="/signup">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="me-1" aria-hidden="true">
                        <circle cx="12" cy="8" r="3" />
                        <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                        <path d="M19 8v6" />
                        <path d="M22 11h-6" />
                      </svg>
                      Sign up
                    </a>
                  </>
                )}
                {/* <form className="d-flex" role="search" onSubmit={handleSearch} id="searchForm"> */}
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  value={input}
                  onChange={(e) => handleChange(e.target.value)}
                  onFocus={() => setSearchFocused(true)} // Set searchFocused to true when search bar is focused
                  onBlur={() => setSearchFocused(false)} // Set searchFocused to false when search bar loses focus
                />
                {showSearchResults && (
                  <ul className="list-group">
                    {searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <li key={result.id} className="list-group-item">
                          <a href={`/product/${result.id}`} className="search-result-link">
                            <span>{result.name}</span>
                          </a>
                        </li>
                      ))
                    ) : (
                      noResults && (
                        <p className="no-results-message">
                          No Prouduct with such Name
                        </p>
                      )
                    )}
                  </ul>
                )}
                {/* <button
                  className="btn btn-outline-success"
                  onClick={handleSearch}
                >
                  Search Products
                </button> */}
                {/* </form> */}
                <div />
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
