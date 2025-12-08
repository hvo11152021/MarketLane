import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../axios";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";
import AddedToCartModal from "./AddedToCartModal";

const Home = ({ selectedCategory }) => {
  const { data, isError, addToCart, refreshData } = useContext(AppContext);

  const [products, setProducts] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [showAddedModal, setShowAddedModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);

  //fetch products when components mounts
  useEffect(() => {
    if (!isDataFetched) {
      refreshData();
      setIsDataFetched(true);
    }
  }, [isDataFetched, refreshData]);

  useEffect(() => {
    //fetch image
    const loadProductImages = async () => {
      if (!data || data.length === 0) {
        setProducts([]);
        return;
      }

      const updatedProducts = await Promise.all(
        data.map(async (product) => {
          try {
            const response = await API.get(`/product/${product.id}/image`, {
              responseType: "blob",
            });
            const imageUrl = URL.createObjectURL(response.data);
            return { ...product, imageUrl };
          } catch (error) {
            console.error("Error fetching product image:", product.id, error);
            return { ...product, imageUrl: unplugged };
          }
        })
      );

      setProducts(updatedProducts);
    };

    loadProductImages();

    return () => {
      products.forEach((p) => {
        if (p?.imageUrl?.startsWith("blob:")) URL.revokeObjectURL(p.imageUrl);
      });
    };
  }, [data]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const formatPrice = (value) => {
    const number = Number(value);
    if (Number.isNaN(number)) return `$${value}`;
    return number.toLocaleString(undefined, { style: "currency", currency: "USD" });
  };

  if (isError) {
    return (
      <div className="page">
        <div className="container py-5">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="text-center">
              <img src={unplugged} alt="Error" style={{ width: 120, height: 120, opacity: 0.9 }} />
              <div className="mt-3 text-muted">Something went wrong loading products.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container py-3">
        <div className="d-flex align-items-end justify-content-between mb-3">
          <div>
            <h4 className="mb-1 fw-bold">Products</h4>
            <div className="text-muted" style={{ fontSize: ".9rem" }}>
              {selectedCategory ? `Category: ${selectedCategory}` : "Browse everything"}
            </div>
          </div>

          <div className="text-muted" style={{ fontSize: ".9rem" }}>
            {filteredProducts.length} item{filteredProducts.length === 1 ? "" : "s"}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-5">
            <div className="fw-bold" style={{ fontSize: "1.05rem" }}>
              No Products Available
            </div>
            <div className="text-muted mt-2">Try a different category.</div>
          </div>
        ) : (
          <div className="row g-4">
            {filteredProducts.map((product) => {
              const { id, brand, name, price, productAvailable, imageUrl, category } = product;

              return (
                <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={id}>
                  <div className="product-card h-100">
                    <Link to={`/product/${id}`} className="product-link">
                      <div className="product-media">
                        <div className="product-chips">
                          <span className="chip">{category || "General"}</span>
                          {!productAvailable ? <span className="chip chip-warn">Unavailable</span> : <span />}
                        </div>

                        <img src={imageUrl || unplugged} alt={name} />

                        {!productAvailable ? <div className="oos">OUT OF STOCK</div> : null}
                      </div>

                      <div className="p-3 d-flex flex-column" style={{ minHeight: 150 }}>
                        <div>
                          <h6 className="product-title">{name}</h6>
                          <p className="product-brand">{brand}</p>
                        </div>

                        <div className="mt-auto d-flex justify-content-between align-items-center pt-2">
                          <div className="price">{formatPrice(price)}</div>

                          <button
                            className="btn btn-primary btn-sm btn-pill"
                            onClick={(e) => {
                              e.preventDefault(); // don't navigate when adding
                              e.stopPropagation();
                              addToCart(product);
                              setAddedProduct(product);
                              setShowAddedModal(true);
                            }}
                            disabled={!productAvailable}
                            aria-label={productAvailable ? "Add to cart" : "Out of stock"}
                          >
                            {productAvailable ? "Add to cart" : "Out of stock"}
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <AddedToCartModal show={showAddedModal} product={addedProduct} onClose={() => setShowAddedModal(false)} />
    </div>
  );
};

export default Home;
