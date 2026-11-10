
const http = require("http");

// Initial product data
let products = [
    {
        id: 1,
        name: "MacBook",
        price: 120000,
        category: "Electronics"
    },
    {
        id: 2,
        name: "iPhone",
        price: 80000,
        category: "Electronics"
    },
    {
        id: 3,
        name: "Headphones",
        price: 5000,
        category: "Accessories"
    }
];

let nextId = 4;

// Send JSON responses
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify(data));
}

// Read JSON request body
function readRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error("Invalid JSON body"));
            }
        });

        req.on("error", reject);
    });
}

// Validate product fields
function validateProduct(data) {
    return (
        data &&
        typeof data === "object" &&
        !Array.isArray(data) &&
        typeof data.name === "string" &&
        data.name.trim().length > 0 &&
        typeof data.price === "number" &&
        Number.isFinite(data.price) &&
        data.price > 0 &&
        typeof data.category === "string" &&
        data.category.trim().length > 0
    );
}

// Create HTTP server
const server = http.createServer(async (req, res) => {

    const url = new URL(req.url, "http://localhost:3008");

    const method = req.method;
    const pathname = url.pathname;

    console.log(`${method} ${pathname}`);

    // GET: Fetch all products
    if (pathname === "/products" && method === "GET") {

        return sendJSON(res, 200, products);

    }

    // POST: Create a new product
    if (pathname === "/products" && method === "POST") {

        try {
            const data = await readRequestBody(req);

            if (!validateProduct(data)) {
                return sendJSON(res, 400, {
                    message: "Invalid product data"
                });
            }

            const newProduct = {
                id: nextId++,
                name: data.name.trim(),
                price: data.price,
                category: data.category.trim()
            };

            products.push(newProduct);

            return sendJSON(res, 201, newProduct);

        } catch (error) {
            return sendJSON(res, 400, {
                message: error.message
            });
        }
    }

    // GET: Fetch a product by ID
    const productMatch = pathname.match(/^\/products\/(\d+)$/);

    if (productMatch) {

        const id = Number(productMatch[1]);

        const productIndex = products.findIndex(
            (product) => product.id === id
        );

        // Product does not exist
        if (productIndex === -1) {
            return sendJSON(res, 404, {
                message: "Product not found"
            });
        }

        const existingProduct = products[productIndex];

        // GET: Read one product
        if (method === "GET") {

            return sendJSON(res, 200, existingProduct);

        }

        // PUT: Replace an entire product
        if (method === "PUT") {

            try {
                const data = await readRequestBody(req);

                if (!validateProduct(data)) {
                    return sendJSON(res, 400, {
                        message: "Provide name, price and category"
                    });
                }

                const updatedProduct = {
                    id: id,
                    name: data.name.trim(),
                    price: data.price,
                    category: data.category.trim()
                };

                products[productIndex] = updatedProduct;

                return sendJSON(res, 200, updatedProduct);

            } catch (error) {
                return sendJSON(res, 400, {
                    message: error.message
                });
            }
        }

        // PATCH: Update selected product fields
        if (method === "PATCH") {

            try {
                const data = await readRequestBody(req);

                if (
                    !data ||
                    typeof data !== "object" ||
                    Array.isArray(data)
                ) {
                    return sendJSON(res, 400, {
                        message: "Invalid product data"
                    });
                }

                const allowedFields = ["name", "price", "category"];

                const fields = Object.keys(data);

                if (
                    fields.length === 0 ||
                    fields.some((field) => !allowedFields.includes(field))
                ) {
                    return sendJSON(res, 400, {
                        message: "Provide valid product fields"
                    });
                }

                const updatedProduct = {
                    ...existingProduct,
                    ...data
                };

                if (!validateProduct(updatedProduct)) {
                    return sendJSON(res, 400, {
                        message: "Invalid product values"
                    });
                }

                updatedProduct.name = updatedProduct.name.trim();
                updatedProduct.category = updatedProduct.category.trim();

                products[productIndex] = updatedProduct;

                return sendJSON(res, 200, updatedProduct);

            } catch (error) {
                return sendJSON(res, 400, {
                    message: error.message
                });
            }
        }

        // DELETE: Delete a product
        if (method === "DELETE") {

            products.splice(productIndex, 1);

            res.writeHead(204);
            return res.end();

        }

        // Unsupported method for this product route
        return sendJSON(res, 405, {
            message: "Method not allowed"
        });
    }

    // Unknown route
    return sendJSON(res, 404, {
        message: "Route not found"
    });

});

// Start server
server.listen(3008, "127.0.0.1", () => {
    console.log("Product REST API running at http://localhost:3008");
});
