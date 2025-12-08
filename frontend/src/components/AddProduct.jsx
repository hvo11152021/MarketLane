import React, { useState, useEffect } from "react";
import API from "../axios";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    productAvailable: false,
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ROLE_ADMIN") navigate("/");
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setError("");
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("imageFile", image);
    formData.append(
      "product",
      new Blob([JSON.stringify(product)], { type: "application/json" })
    );

    try {
      const response = await API.post("/product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Product added:", response.data);
      setError("");
      navigate("/");
    } catch (err) {
      const parseError = (data) => {
        if (!data) return "";
        if (typeof data === "string") {
          const line = data.split("\n")[0];
          const idx = line.indexOf(": ");
          return idx !== -1 ? line.slice(idx + 2).trim() : line.trim();
        }
        if (typeof data === "object") {
          return (
            data.message ||
            data.error ||
            data.detail ||
            data.exception ||
            (Array.isArray(data) && data[0]?.message) ||
            Object.values(data).find((v) => typeof v === "string") ||
            ""
          );
        }
        return String(data);
      };

      if (err.response) {
        setError(parseError(err.response.data) || `Server responded ${err.response.status}`);
      } else if (err.request) {
        setError("No response from server");
      } else {
        setError(err.message || "Error adding product");
      }
    }
  };

  return (
    <div className="container">
      <div className="center-container">
        <form className="row g-3 pt-5" onSubmit={submitHandler}>
          {error && (
            <div className="col-12">
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            </div>
          )}
          <div className="col-md-6"><label className="form-label"><h6>Name</h6></label><input type="text" className="form-control" placeholder="Product Name" onChange={handleInputChange} value={product.name} name="name" /></div>

          <div className="col-md-6"><label className="form-label"><h6>Brand</h6></label><input type="text" name="brand" className="form-control" placeholder="Enter your Brand" value={product.brand} onChange={handleInputChange} id="brand" /></div>

          <div className="col-12"><label className="form-label"><h6>Description</h6></label><input type="text" className="form-control" placeholder="Add product description" value={product.description} name="description" onChange={handleInputChange} id="description" /></div>

          <div className="col-5"><label className="form-label"><h6>Price</h6></label><input type="number" className="form-control" placeholder="Eg: $1000" onChange={handleInputChange} value={product.price} name="price" id="price" /></div>

          <div className="col-md-6"><label className="form-label"><h6>Category</h6></label><select className="form-select" value={product.category} onChange={handleInputChange} name="category" id="category"><option value="">Select category</option><option value="Laptop">Laptop</option><option value="Headphone">Headphone</option><option value="Mobile">Mobile</option><option value="Electronics">Electronics</option><option value="Toys">Toys</option><option value="Fashion">Fashion</option></select></div>

          <div className="col-md-4"><label className="form-label"><h6>Stock Quantity</h6></label><input type="number" className="form-control" placeholder="Stock Remaining" onChange={handleInputChange} value={product.stockQuantity} name="stockQuantity" id="stockQuantity" /></div>

          <div className="col-md-4"><label className="form-label"><h6>Release Date</h6></label><input type="date" className="form-control" value={product.releaseDate} name="releaseDate" onChange={handleInputChange} id="releaseDate" /></div>

          <div className="col-md-4">
            <label className="form-label">
              <h6>Image</h6>
            </label>
            <input
              className="form-control"
              type="file"
              onChange={handleImageChange}
            />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="productAvailable"
                id="gridCheck"
                checked={product.productAvailable}
                onChange={(e) =>
                  setProduct({ ...product, productAvailable: e.target.checked })
                }
              />
              <label className="form-check-label">Product Available</label>
            </div>
          </div>
          <div className="col-12">
            <button
              type="submit"
              className="btn btn-primary"
            // onClick={submitHandler}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
