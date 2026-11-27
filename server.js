const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const menu = require("./data/menu");

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const MAX_BODY_BYTES = 100 * 1024;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function calculateBill(items, couponCode = "") {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const normalizedCoupon = String(couponCode).trim().toUpperCase();
  const discount = normalizedCoupon === "FOODIE10" && subtotal >= 199
    ? Math.round(subtotal * 0.10)
    : 0;
  const deliveryFee = subtotal === 0 || subtotal >= 499 ? 0 : 29;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.05);
  return {
    subtotal,
    discount,
    deliveryFee,
    tax,
    total: subtotal - discount + deliveryFee + tax,
    couponApplied: discount > 0 ? "FOODIE10" : null
  };
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let received = 0;
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      received += Buffer.byteLength(chunk);
      if (received > MAX_BODY_BYTES) {
        const error = new Error("Request body is too large.");
        error.statusCode = 413;
        reject(error);
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        const error = new Error("Request body must contain valid JSON.");
        error.statusCode = 400;
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function validateAndNormalizeOrder(body) {
  const { customer, items, couponCode } = body || {};
  const errors = [];

  if (!customer || typeof customer !== "object" || Array.isArray(customer)) {
    errors.push("Please enter your delivery details.");
  } else {
    if (typeof customer.name !== "string" || customer.name.trim().length < 2) {
      errors.push("Please enter a name with at least 2 characters.");
    }
    const phone = String(customer.phone || "").replace(/[\s-]/g, "");
    if (!/^\+?[0-9]{10,15}$/.test(phone)) {
      errors.push("Please enter a valid phone number (10–15 digits).");
    }
    if (typeof customer.address !== "string" || customer.address.trim().length < 8) {
      errors.push("Please enter a complete delivery address.");
    }
    if (!["cod", "upi-demo"].includes(customer.paymentMethod)) {
      errors.push("Please select a valid payment method.");
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.push("Your cart is empty.");
  }

  const normalizedItems = [];
  if (Array.isArray(items)) {
    for (const entry of items) {
      const product = menu.find((food) => food.id === entry?.id);
      const quantity = Number(entry?.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        errors.push("One or more cart items are invalid. Please review your cart.");
        break;
      }
      normalizedItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        lineTotal: product.price * quantity
      });
    }
  }

  if (errors.length) return { errors };
  return {
    customer: {
      name: customer.name.trim(),
      phone: String(customer.phone).trim(),
      address: customer.address.trim(),
      paymentMethod: customer.paymentMethod
    },
    items: normalizedItems,
    couponCode: typeof couponCode === "string" ? couponCode : ""
  };
}

async function serveStatic(pathname, res) {
  let requestedPath;
  try {
    requestedPath = decodeURIComponent(pathname);
  } catch {
    return sendJson(res, 400, { success: false, message: "Invalid URL encoding." });
  }
  if (requestedPath === "/") requestedPath = "/index.html";
  const safePath = path.normalize(requestedPath).replace(/^([.][.][/\\])+/, "");
  const filePath = path.resolve(PUBLIC_DIR, `.${safePath}`);
  if (!filePath.startsWith(`${PUBLIC_DIR}${path.sep}`) && filePath !== path.join(PUBLIC_DIR, "index.html")) {
    return sendJson(res, 403, { success: false, message: "Forbidden." });
  }
  try {
    const content = await fs.promises.readFile(filePath);
    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": content.length,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache"
    });
    return res.end(content);
  } catch {
    return sendJson(res, 404, { success: false, message: "Page or file not found." });
  }
}

async function handleRequest(req, res, loadOrderStore) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = requestUrl.pathname;

  if (req.method === "GET" && pathname === "/api/health") {
    return sendJson(res, 200, { status: "ok", app: "Foodie-Hub", timestamp: new Date().toISOString() });
  }

  if (req.method === "GET" && pathname === "/api/menu") {
    return sendJson(res, 200, { success: true, count: menu.length, items: menu });
  }

  if (req.method === "POST" && pathname === "/api/orders") {
    let body;
    try {
      body = await readJsonBody(req);
    } catch (error) {
      if (!res.writableEnded && !res.destroyed) {
        return sendJson(res, error.statusCode || 400, { success: false, errors: [error.message] });
      }
      return;
    }
    const normalized = validateAndNormalizeOrder(body);
    if (normalized.errors) {
      return sendJson(res, 400, { success: false, errors: normalized.errors });
    }
    const bill = calculateBill(normalized.items, normalized.couponCode);
    const orderId = `FH${randomUUID()}`;
    const order = {
      orderId,
      customer: normalized.customer,
      items: normalized.items,
      bill,
      status: "Order received",
      createdAt: new Date().toISOString()
    };
    const { saveOrder } = await loadOrderStore();
    await saveOrder(order);
    return sendJson(res, 201, { success: true, message: "Your order has been placed!", order });
  }

  const orderMatch = pathname.match(/^\/api\/orders\/([A-Za-z0-9-]+)$/);
  if (req.method === "GET" && orderMatch) {
    const { findOrder } = await loadOrderStore();
    const order = await findOrder(orderMatch[1]);
    if (!order) {
      return sendJson(res, 404, { success: false, message: "Order not found." });
    }
    return sendJson(res, 200, {
      success: true,
      order: {
        orderId: order.orderId,
        items: order.items,
        bill: order.bill,
        status: order.status,
        createdAt: new Date(order.createdAt).toISOString()
      }
    });
  }

  if (req.method === "GET" && !pathname.startsWith("/api/")) {
    return serveStatic(pathname, res);
  }

  return sendJson(res, 404, { success: false, message: "Endpoint not found." });
}

function createServer(loadOrderStore = () => import("./db/orders.mjs")) {
  return http.createServer((req, res) => {
    handleRequest(req, res, loadOrderStore).catch((error) => {
      const databaseCode = error.cause?.code;
      if (typeof databaseCode === "string" && /^[A-Z0-9]{5}$/.test(databaseCode)) {
        console.error(`Foodie-Hub request failed (database code ${databaseCode}).`);
      } else {
        console.error("Foodie-Hub request failed.");
      }
      if (!res.headersSent) sendJson(res, 500, { success: false, message: "Internal server error." });
      else if (!res.writableEnded) res.end();
    });
  });
}

const server = createServer();

if (require.main === module) {
  // If the preferred port is already occupied, try the next available port.
  // This commonly happens when an earlier development server is still running.
  const MAX_PORT_ATTEMPTS = 20;

  function startServer(port, attempt = 0) {
    const onError = (error) => {
      server.removeListener("listening", onListening);

      if (error.code === "EADDRINUSE" && attempt < MAX_PORT_ATTEMPTS) {
        const nextPort = port + 1;
        console.warn(`Port ${port} is already in use. Trying port ${nextPort}...`);
        startServer(nextPort, attempt + 1);
        return;
      }

      console.error(`\nUnable to start Foodie-Hub: ${error.message}`);
      if (error.code === "EADDRINUSE") {
        console.error(`Tried ports ${PORT} to ${port}. Close the other app or set PORT to a free port.`);
      }
      process.exitCode = 1;
    };

    const onListening = () => {
      server.removeListener("error", onError);
      const address = server.address();
      const activePort = typeof address === "object" && address ? address.port : port;
      console.log(`\n🍔 Foodie-Hub is running at http://localhost:${activePort}`);
      if (activePort !== PORT) {
        console.log(`(Default port ${PORT} was busy, so Foodie-Hub selected ${activePort}.)`);
      }
      console.log("Press Ctrl + C to stop the server.\n");
    };

    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port);
  }

  startServer(PORT);
}

module.exports = { server, createServer, calculateBill, validateAndNormalizeOrder };
