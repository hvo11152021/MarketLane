import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "../Context/Context";
import API from "../axios";
import unplugged from "../assets/unplugged.png";
import AddedToCartModal from "./AddedToCartModal";

const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, refreshData } = useContext(AppContext);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [showAddedModal, setShowAddedModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);

  // fetch product data and image on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/product/${id}`);
        setProduct(response.data || null);
        if (response.data?.imageName) fetchImage();
      } catch {
        console.error("Error fetching product");
      }
    };

    const fetchImage = async () => {
      try {
        const resp = await API.get(`/product/${id}/image`, { responseType: "blob" });
        setImageUrl(URL.createObjectURL(resp.data));
      } catch {
        setImageUrl(unplugged);
      }
    };

    fetchProduct();
  }, [id]);

  // delete product and update state
  const deleteProduct = async () => {
    if (!window.confirm("Delete this product? This action cannot be undone.")) return;

    try {
      await API.delete(`/product/${id}`);
      removeFromCart(id);
      refreshData();
      navigate("/");
    } catch {
      console.error("Error deleting product");
    }
  };

  const handleEditClick = () => navigate(`/product/update/${id}`);

  // add product to cart and show confirmation modal
  const handleAddToCart = () => {
    addToCart(product);
    setAddedProduct({ ...product, imageUrl });
    setShowAddedModal(true);
  };

  if (!product) {
    return (
      <h2 className="text-center" style={{ padding: "6rem" }}>
        Loading...
      </h2>
    );
  }

  return (
    <div className="container" style={{ marginTop: 80 }}>
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card">
            <div style={{ height: 320, overflow: "hidden" }}>
              <img
                src={imageUrl || unplugged}
                alt={product.imageName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card p-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <div className="text-muted" style={{ fontSize: ".9rem" }}>{product.category}</div>
                <h2 style={{ margin: 0, textTransform: 'capitalize' }}>{product.name}</h2>
                <div className="text-muted">{product.brand}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>${product.price}</div>
                <div className="text-muted" style={{ fontSize: '.85rem' }}>Stock: {product.stockQuantity}</div>
              </div>
            </div>

            <hr />

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Description</div>
              <div className="text-muted">{product.description}</div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-primary" onClick={handleAddToCart} disabled={!product.productAvailable}>
                {product.productAvailable ? 'Add to cart' : 'Out of stock'}
              </button>
              <button className="btn btn-outline-secondary" onClick={handleEditClick}>Edit</button>
              <button className="btn btn-danger" onClick={deleteProduct}>Delete</button>
            </div>

            <div className="mt-3 text-muted" style={{ fontSize: '.85rem' }}>
              Listed: {product.releaseDate ? new Date(product.releaseDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>
      <AddedToCartModal show={showAddedModal} onClose={() => setShowAddedModal(false)} product={addedProduct} />
    </div>
  );
};

export default Product;