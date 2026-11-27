const test = require("node:test");
const assert = require("node:assert/strict");
const { server, calculateBill } = require("./server");

let baseUrl;
test.before(async () => {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("calculates delivery fee and 5% tax for a small order", () => {
  const bill = calculateBill([{ price: 100, quantity: 1 }]);
  assert.deepEqual(bill, {
    subtotal: 100, discount: 0, deliveryFee: 29, tax: 5, total: 134, couponApplied: null
  });
});

test("free delivery applies at ₹499", () => {
  const bill = calculateBill([{ price: 499, quantity: 1 }]);
  assert.equal(bill.deliveryFee, 0);
  assert.equal(bill.tax, 25);
  assert.equal(bill.total, 524);
});

test("FOODIE10 gives 10% off when subtotal is at least ₹199", () => {
  const bill = calculateBill([{ price: 250, quantity: 1 }], "foodie10");
  assert.equal(bill.discount, 25);
  assert.equal(bill.couponApplied, "FOODIE10");
  assert.equal(bill.total, 265);
});

test("FOODIE10 does not apply below ₹199", () => {
  const bill = calculateBill([{ price: 150, quantity: 1 }], "FOODIE10");
  assert.equal(bill.discount, 0);
  assert.equal(bill.couponApplied, null);
});

test("supports multiple quantities", () => {
  const bill = calculateBill([
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 }
  ]);
  assert.equal(bill.subtotal, 250);
  assert.equal(bill.total, 292);
});

test("homepage serves the Foodie-Hub website", async () => {
  const response = await fetch(`${baseUrl}/`);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(html, /Foodie-Hub/);
});

test("health endpoint responds successfully", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.status, "ok");
});

test("menu endpoint provides 20 food items", async () => {
  const response = await fetch(`${baseUrl}/api/menu`);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.count, 20);
  assert.equal(data.items.length, 20);
});

test("rejects an invalid order", async () => {
  const response = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer: {}, items: [] })
  });
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.equal(data.success, false);
  assert.ok(data.errors.length > 0);
});

test("places a valid order and returns a server-calculated bill", async () => {
  const response = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: {
        name: "Demo Student",
        phone: "9876543210",
        address: "12 College Road, Chennai, Tamil Nadu",
        paymentMethod: "cod"
      },
      items: [{ id: "classic-cheeseburger", quantity: 2 }],
      couponCode: "FOODIE10"
    })
  });
  const data = await response.json();
  assert.equal(response.status, 201);
  assert.equal(data.success, true);
  assert.ok(data.order.orderId.startsWith("FH"));
  assert.equal(data.order.bill.subtotal, 378);
  assert.equal(data.order.bill.discount, 38);

  const lookup = await fetch(`${baseUrl}/api/orders/${data.order.orderId}`);
  const saved = await lookup.json();
  assert.equal(lookup.status, 200);
  assert.equal(saved.order.orderId, data.order.orderId);
});
