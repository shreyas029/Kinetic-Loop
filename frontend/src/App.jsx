
import { useState, useEffect } from 'react'
import './App.css'

// Main React component for the KINETIC LOOP storefront.
function App() {
  // Store products added to the shopping bag.
  const [cart, setCart] = useState([])

  // Control the visibility of the shopping bag.
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Store product data received from the backend API.
  const [products, setProducts] = useState([])

  // Store an error message if products cannot be loaded.
  const [productsError, setProductsError] = useState('')

  // Control the checkout form and order confirmation popup.
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState(null)

  // Fetch the product catalog once when the component mounts.
  useEffect(() => {
    fetch('https://kinetic-loop-backend.onrender.com/api/products')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }

        return response.json()
      })
      .then((data) => {
        setProducts(data)
        console.log('Products from backend:', data)
      })
      .catch((error) => {
        console.error('Error fetching products:', error)
        setProductsError('Unable to load products. Please try again later.')
      })
  }, [])

  // Add a selected product to the shopping bag.
  const addToCart = (productName, productPrice) => {
    const newProduct = {
      name: productName,
      price: productPrice
    }

    setCart((previousCart) => [...previousCart, newProduct])
  }

  // Remove a single product using its position in the cart.
  const removeFromCart = (indexToRemove) => {
    setCart((previousCart) =>
      previousCart.filter((product, index) => index !== indexToRemove)
    )
  }

  // Calculate the total price of all products in the cart.
  const cartTotal = cart.reduce((total, product) => {
    return total + product.price
  }, 0)

  return (
    <div>
      {/* Header containing the brand, navigation, and shopping bag button. */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 8%',
        backgroundColor: '#ffffff'
      }}>
        <h2 className="brand-logo">
          <span>KINETIC</span>
          <span className="brand-logo-accent">LOOP</span>
        </h2>

        <nav style={{ display: 'flex', gap: '30px' }}>
          <a href="#home">Home</a>
          <a href="#products">Technology</a>
          <a href="#products">Shop Straps</a>

          {/* Display the number of items and the current cart total. */}
          <button
            type="button"
            className="cart-counter"
            onClick={() => setIsCartOpen(!isCartOpen)}
          >
            🛍️ Bag ({cart.length}) — ₹{cartTotal.toLocaleString('en-IN')}
          </button>
        </nav>
      </header>

      {/* Show the shopping bag only when it is opened. */}
      {isCartOpen && (
        <div className="cart-overlay">
          <div className="cart-panel">
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
            >
              ✕ Close
            </button>

            <h2>Your Shopping Bag</h2>

            {/* Show an empty message or list the selected products. */}
            {cart.length === 0 ? (
              <p>Your bag is empty.</p>
            ) : (
              <>
                {cart.map((product, index) => (
                  <div key={index} className="cart-item">
                    <span>{product.name}</span>

                    <strong>
                      ₹{product.price.toLocaleString('en-IN')}
                    </strong>

                    <button
                      type="button"
                      onClick={() => removeFromCart(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <h3>
                  Total: ₹{cartTotal.toLocaleString('en-IN')}
                </h3>

                {/* Close the bag and open the checkout form. */}
                <button
                  className="checkout-button"
                  onClick={() => {
                    setIsCartOpen(false)
                    setIsCheckoutOpen(true)
                  }}
                >
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout form for collecting demo customer details. */}
      {isCheckoutOpen && (
        <div className="cart-overlay">
          <div className="cart-modal">
            <button
              className="checkout-close"
              onClick={() => setIsCheckoutOpen(false)}
            >
              × Close
            </button>

            <h2>Checkout</h2>
            <p>Complete your KINETIC LOOP order</p>

            <form onSubmit={async (e) => {
              // Prevent the browser from reloading the page.
              e.preventDefault()

              // Read the customer details entered in the form.
              const formData = new FormData(e.currentTarget)

              try {
                // Submit the demo order to the backend API.
                const response = await fetch(
                  'https://kinetic-loop-backend.onrender.com/api/orders',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      name: formData.get('name'),
                      email: formData.get('email'),
                      address: formData.get('address'),
                      items: cart
                    })
                  }
                )

                const data = await response.json()

                // Report an error if the backend rejects the order.
                if (!response.ok) {
                  throw new Error(data.message || 'Order failed')
                }

                // Save the confirmed order, clear the cart,
                // and close the checkout form.
                setConfirmedOrder(data.order)
                setCart([])
                setIsCheckoutOpen(false)
              } catch (error) {
                alert(error.message)
              }
            }}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
              />

              <textarea
                name="address"
                placeholder="Delivery Address"
                required
              />

              <h3>
                Total: ₹{cartTotal.toLocaleString('en-IN')}
              </h3>

              <button
                type="submit"
                className="checkout-button"
              >
                Place Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Display order details after a successful checkout. */}
      {confirmedOrder && (
        <div className="cart-overlay">
          <div className="cart-modal order-confirmation">
            <div className="success-icon">✓</div>

            <h2>Order Placed Successfully!</h2>

            <p>
              Thank you for shopping with KINETIC LOOP.
            </p>

            <p>Your order has been received.</p>

            <div className="order-details">
              <p>
                <strong>Order ID:</strong> {confirmedOrder.id}
              </p>

              <p>
                <strong>Total:</strong> ₹
                {confirmedOrder.total.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Dismiss the confirmation and return to shopping. */}
            <button
              className="checkout-button"
              onClick={() => setConfirmedOrder(null)}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Homepage hero section introducing the product concept. */}
      <main id="home" style={{
        textAlign: 'center',
        padding: '100px 20px',
        backgroundColor: '#f5f5f7',
        color: '#1d1d1f'
      }}>
        <p>INTRODUCING KINETIC LOOP</p>

        <h1 style={{ fontSize: '56px', margin: '20px 0' }}>
          Power Your Everyday.
        </h1>

        <p style={{ fontSize: '20px' }}>
          The next generation of energy-harvesting
          smartwatch straps.
        </p>

        <p>
          Harness sunlight, body heat, and wrist movement
          with semiconductor-enabled technology.
        </p>

        {/* Smoothly scroll to the product collection. */}
        <button
          className="explore-button"
          onClick={() =>
            document.getElementById('products')?.scrollIntoView({
              behavior: 'smooth'
            })
          }
        >
          Explore Kinetic Loop
          <span aria-hidden="true">→</span>
        </button>
      </main>

      {/* Product collection section. */}
      <section id="products" className="products-section">
        {/* Display a message if the product API request fails. */}
        {productsError && (
          <p style={{
            color: '#d32f2f',
            textAlign: 'center',
            padding: '15px'
          }}>
            {productsError}
          </p>
        )}

        <div className="section-heading">
          <p className="eyebrow">THE KINETIC LOOP COLLECTION</p>
          <h2>Find your perfect energy strap.</h2>
          <p>
            Explore our concept collection of
            energy-harvesting smartwatch straps.
          </p>
        </div>

        <div className="product-grid">
          {/* Solar Loop: uses product API data when available. */}
          <article className="product-card">
            <div className="product-image solar">
              <img
                src="/images/solar%20loop.jpg"
                alt="Solar Loop energy-harvesting smartwatch strap"
                className="strap-image"
              />
            </div>

            <p className="product-label">SOLAR TECHNOLOGY</p>
            <h3>{products[0]?.name || 'Solar Loop'}</h3>

            <p>
              {products[0]?.description || 'Harness energy from sunlight.'}
            </p>

            <p className="product-price">
              ₹{(products[0]?.price ?? 2999).toLocaleString('en-IN')}
            </p>

            <button
              className="add-to-cart"
              onClick={() => addToCart(
                products[0]?.name || 'Solar Loop',
                products[0]?.price ?? 2999
              )}
            >
              Add to Bag
            </button>
          </article>

          {/* Thermal Loop: energy harvesting from body heat. */}
          <article className="product-card">
            <div className="product-image thermal">
              <img
                src="/images/thermal-loop.jpg"
                alt="Thermal Loop thermoelectric smartwatch strap"
                className="strap-image"
              />
            </div>

            <p className="product-label">THERMOELECTRIC</p>
            <h3>{products[1]?.name || 'Thermal Loop'}</h3>

            <p>
              {products[1]?.description || 'Harvest energy from body heat.'}
            </p>

            <p className="product-price">
              ₹{(products[1]?.price ?? 3499).toLocaleString('en-IN')}
            </p>

            <button
              className="add-to-cart"
              onClick={() => addToCart(
                products[1]?.name || 'Thermal Loop',
                products[1]?.price ?? 3499
              )}
            >
              Add to Bag
            </button>
          </article>

          {/* Motion Loop: energy harvesting from wrist movement. */}
          <article className="product-card">
            <div className="product-image motion">
              <img
                src="/images/motion-loop.jpg"
                alt="Motion Loop kinetic energy-harvesting smartwatch strap"
                className="strap-image"
              />
            </div>

            <p className="product-label">MOTION TECHNOLOGY</p>
            <h3>{products[2]?.name || 'Motion Loop'}</h3>

            <p>
              {products[2]?.description || 'Capture energy from wrist movement.'}
            </p>

            <p className="product-price">
              ₹{(products[2]?.price ?? 3999).toLocaleString('en-IN')}
            </p>

            <button
              className="add-to-cart"
              onClick={() => addToCart(
                products[2]?.name || 'Motion Loop',
                products[2]?.price ?? 3999
              )}
            >
              Add to Bag
            </button>
          </article>
        </div>
      </section>
    </div>
  )
}

export default App
