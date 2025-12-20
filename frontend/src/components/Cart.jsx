import React, { useContext, useState, useEffect } from "react";
import AppContext from "../Context/Context";
import API from "../axios";
import CheckoutPopup from "./CheckoutPopup";
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useContext(AppContext);
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartImage, setCartImage] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ROLE_USER" && role !=="ROLE_ADMIN") 
      navigate("/");
  }, [navigate]);

  // fetch product images and update cart items
  useEffect(() => {
    const fetchImagesAndUpdateCart = async () => {
      try {
        const response = await API.get("/products");
        const backendProductIds = response.data.map((p) => p.id);

        const validCartItems = cart.filter((item) => backendProductIds.includes(item.id));
        const itemsWithImages = await Promise.all(
          validCartItems.map(async (item) => {
            try {
              const resp = await API.get(`/product/${item.id}/image`, { responseType: "blob" });
              const imageUrl = URL.createObjectURL(resp.data);
              return { ...item, imageUrl };
            } catch {
              return { ...item, imageUrl: null };
            }
          })
        );

        setCartItems(itemsWithImages);
      } catch {
        console.error("Error fetching product data");
      }
    };

    if (cart.length) fetchImagesAndUpdateCart();
  }, [cart]);

  // calculate total price whenever cart items change
  useEffect(() => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(total);
  }, [cartItems]);

  // turn blob to File
  const convertUrlToFile = async (blobData, fileName) => {
    return new File([blobData], fileName, { type: blobData.type });
  };

  // increase item quantity
  const handleIncreaseQuantity = (itemId) => {
    const newCartItems = cartItems.map((item) => {
      if (item.id === itemId) {
        if (item.quantity < item.stockQuantity) return { ...item, quantity: item.quantity + 1 };
        alert("Cannot add more than available stock");
      }
      return item;
    });
    setCartItems(newCartItems);
  };

  // decrease item quantity
  const handleDecreaseQuantity = (itemId) => {
    const newCartItems = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: Math.max(item.quantity - 1, 1) } : item
    );
    setCartItems(newCartItems);
  };

  // remove item from cart
  const handleRemoveFromCart = (itemId) => {
    if (!window.confirm("Remove this item from cart?")) return;
    removeFromCart(itemId);
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  // checkout and update backend stock
  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      for (const item of cartItems) {
        const { imageUrl, imageName, imageData, imageType, quantity, ...rest } = item;
        const updatedStockQuantity = item.stockQuantity - item.quantity;
        const updatedProductData = { ...rest, stockQuantity: updatedStockQuantity };

        const formData = new FormData();
        if (cartImage) formData.append("imageFile", cartImage);
        formData.append("product", new Blob([JSON.stringify(updatedProductData)], { type: "application/json" }));

        await API.put(`/product/${item.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      clearCart();
      setCartItems([]);
      setShowModal(false);
    } catch {
      console.error("Error during checkout");
    }
  };

  return (
    <div className="container" style={{ marginTop: 80, padding: 20 }}>
      <h3 className="mb-3">Shopping Bag</h3>
      {cartItems.length === 0 ? (
        <div className="text-center p-4">Your cart is empty</div>
      ) : (
        <div className="row g-3">
          <div className="col-12 col-md-8">
            {cartItems.map((item) => (
              <div key={item.id} className="card mb-3">
                <div className="row g-0 align-items-center">
                  <div className="col-4 col-md-3" style={{ maxHeight: 140, overflow: 'hidden' }}>
                    <img src={item.imageUrl || '/assets/unplugged.png'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="col-8 col-md-9">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="card-title mb-1">{item.name}</h6>
                          <p className="text-muted mb-0" style={{ fontSize: '.9rem' }}>{item.brand}</p>
                        </div>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveFromCart(item.id)}>
                          <i className="bi bi-trash3-fill"></i>
                        </button>
                      </div>

                      <div className="mt-2 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <button className="btn btn-light btn-sm" onClick={() => handleDecreaseQuantity(item.id)}>
                            <i className="bi bi-dash-square-fill"></i>
                          </button>
                          <div className="badge bg-secondary text-white">{item.quantity}</div>
                          <button className="btn btn-light btn-sm" onClick={() => handleIncreaseQuantity(item.id)}>
                            <i className="bi bi-plus-square-fill"></i>
                          </button>
                        </div>
                        <div style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="col-12 col-md-4">
            <div className="card p-3">
              <h5>Order Summary</h5>
              <div className="d-flex justify-content-between my-2">
                <div>Items</div>
                <div>{cartItems.length}</div>
              </div>
              <div className="d-flex justify-content-between my-2">
                <div>Total</div>
                <div style={{ fontWeight: 800 }}>${totalPrice.toFixed(2)}</div>
              </div>
              <Button variant="primary" className="w-100 mt-2" onClick={() => setShowModal(true)}>Checkout</Button>
            </div>
          </div>
        </div>
      )}

      <CheckoutPopup
        show={showModal}
        handleClose={() => setShowModal(false)}
        cartItems={cartItems}
        totalPrice={totalPrice}
        handleCheckout={handleCheckout}
      />
    </div>
  );
};

export default Cart;
