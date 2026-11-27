# Foodie-Hub 🍔

**Tagline:** Good food, good mood.

Foodie-Hub is a responsive food-ordering website built for a college project using **HTML, CSS, JavaScript and Node.js**. Its backend uses Node.js built-in HTTP and file-system modules, so there are no third-party server dependencies. Customers can browse a menu, filter and search food, add quantities to a cart, apply a coupon, see a live bill and place a demo order.

## Features

- 20 food and drink choices across Burgers, Pizza, Indian Meals, Pasta, Asian, Snacks, Desserts and Drinks.
- Real food photography loaded from Unsplash image URLs. An internet connection is needed to display these remote photographs; the ordering application itself runs locally.
- Responsive layout for desktop, tablet and mobile.
- Search by item name, category or description.
- Category filters, vegetarian-only filter and sorting by recommendation, price or rating.
- Add to cart, increase/decrease quantity, remove items and automatic cart count.
- Live bill preview with subtotal, delivery, 5% tax and total.
- `FOODIE10` coupon: 10% off when the food subtotal is at least ₹199.
- Free delivery for food subtotals of ₹499 or more; otherwise delivery is ₹29.
- Checkout form with name, phone number, address and payment selection.
- Server-side validation and server-side bill calculation before an order is accepted.
- Order confirmation with a unique order number.
- Basic automated tests for bill calculations.

## Requirements

- Node.js 18 or newer
- npm (included with Node.js; no external packages are required)
- Visual Studio Code (recommended)

## Run in Visual Studio Code

1. Download and extract `Foodie-Hub.zip`.
2. Open the extracted **foodie-hub** folder in Visual Studio Code.
3. Open **Terminal → New Terminal**.
4. Start the server:

   ```bash
   npm start
   ```

5. Open the address printed in the terminal. Normally this is **http://localhost:3000**. If port 3000 is already occupied, Foodie-Hub automatically tries 3001, 3002 and further ports until it finds an available one (up to 20 attempts).

6. To stop the server, return to the terminal and press **Ctrl + C**.

### Port 3000 is already in use?

You do not need to edit the code. Start the app with `npm start`; the server automatically selects the next available port and prints the correct URL. Use the exact URL shown in the terminal.

### Development mode

Node.js 18.11+ supports the built-in watch mode used by this project:

```bash
npm run dev
```

### Run tests

```bash
npm test
```

## How to demonstrate the project

1. Open the menu and choose a category such as **Indian meals** or **Pizza**.
2. Search for a dish or enable **Veg only**.
3. Press **Add** on a few food cards.
4. Open **My cart** and change item quantities or remove an item.
5. Enter `FOODIE10` and press **Apply**. The order subtotal must be at least ₹199 for the discount to apply.
6. Review the subtotal, discount, delivery fee, tax and final amount.
7. Continue to checkout, enter the required delivery details and place the demo order.
8. Show the generated order number on the confirmation screen.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check whether the server is running |
| GET | `/api/menu` | Retrieve all food items |
| POST | `/api/orders` | Validate and place a demo order |
| GET | `/api/orders/:orderId` | Retrieve an order created during the current server session |

### Example order request

```json
{
  "customer": {
    "name": "Demo Student",
    "phone": "9876543210",
    "address": "12 College Road, Chennai, Tamil Nadu",
    "paymentMethod": "cod"
  },
  "items": [
    { "id": "classic-cheeseburger", "quantity": 2 },
    { "id": "fresh-lime-soda", "quantity": 1 }
  ],
  "couponCode": "FOODIE10"
}
```

## Project structure

```text
foodie-hub/
├── data/
│   └── menu.js          # Food catalogue and prices
├── public/
│   ├── index.html       # Website structure
│   ├── styles.css       # Responsive design and animations
│   └── app.js           # Search, filters, cart and checkout UI
├── server.js            # Node.js HTTP server and order API
├── test.js              # Bill calculation tests
├── package.json
├── .gitignore
└── README.md
```

## Important project notes

- This is a **working academic/demo ordering flow**, not a live restaurant payment system. The UPI option is labelled as demo-only; no payment is processed.
- Orders are stored in server memory for demonstration. They can be retrieved while the server is running, and are cleared when the server is stopped or restarted. A production deployment should use a database such as MongoDB and a real payment provider.
- Food photos are loaded from Unsplash via remote image URLs, so the browser needs an internet connection to display them. Image availability is controlled by the image host.
- Prices, tax and delivery rules are sample values for this student project and can be edited in `data/menu.js` and `server.js`.

## Technologies

- **HTML5** — page structure and forms
- **CSS3** — responsive layout, styling and animations
- **JavaScript (ES6+)** — menu rendering, filtering, cart and checkout interactions
- **Node.js** — server runtime
- **Node.js HTTP module** — static hosting and REST API

---

Made with ♥ for food lovers.
