import React, { useEffect, useState, useContext } from "react";
import API from "../axios";
import AppContext from "../Context/Context";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onSelectCategory }) => {
  // get initial theme from localStorage
  const getInitialTheme = () => localStorage.getItem("theme") || "light-theme";

  const [selectedCategory, setSelectedCategory] = useState("");
  const [theme, setTheme] = useState(getInitialTheme());
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { refreshData } = useContext(AppContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  // update auth state on storage or authChanged events and preload search data
  useEffect(() => {
    const onStorageOrAuthChanged = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
      setUsername(localStorage.getItem("username") || "");
      setRole(localStorage.getItem("role") || "");
    };

    window.addEventListener("storage", onStorageOrAuthChanged);
    window.addEventListener("authChanged", onStorageOrAuthChanged);

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
      window.removeEventListener("storage", onStorageOrAuthChanged);
      window.removeEventListener("authChanged", onStorageOrAuthChanged);
    };
  }, []);

  // handle search input changes
  const handleChange = async (value) => {
    setInput(value);

    if (value.length >= 1) {
      setShowSearchResults(true);
      try {
        const response = await API.get(`/products/search?keyword=${encodeURIComponent(value)}`);
        setSearchResults(response.data);
        setNoResults(response.data.length === 0);
      } catch (err) {
        console.error("Error searching products:", err);
      }
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
      setNoResults(false);
    }
  };

  // handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    onSelectCategory(category);
    try {
      refreshData(category); // fetch filtered products via context
    } catch (err) {
      console.error("Error refreshing data by category:", err);
    }
    navigate("/"); // navigate to home to show filtered results
  };

  // handle logout action
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    setIsAuthenticated(false);
    setUsername("");

    window.dispatchEvent(new Event("authChanged")); // notify same-tab listeners
    refreshData(); // refresh product list as anonymous
    navigate("/");
  };

  // apply theme to document body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const categories = ["Laptop", "Headphone", "Mobile", "Electronics", "Toys", "Fashion"];

  return (
    <>
      <header>
        <nav className="navbar navbar-expand-lg fixed-top">
          <div className="container-fluid">
            <a className="navbar-brand">MarketLane</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">

                <li className="nav-item">
                  <a className="nav-link active" aria-current="page" href="/">Home</a>
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
                  <a className="nav-link dropdown-toggle" href="/" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Categories
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <button className="dropdown-item" onClick={() => handleCategorySelect("")}>
                        All Categories
                      </button>
                    </li>
                    {categories.map((category) => (
                      <li key={category}>
                        <button className="dropdown-item" onClick={() => handleCategorySelect(category)}>
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
                <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" value={input}
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
                        <p className="no-results-message">No Prouduct with such Name</p>
                      )
                    )}
                  </ul>
                )}
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
