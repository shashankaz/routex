import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "RouteX API",
      version: "1.0.0",
      description:
        "RouteX — Society HomeChef Platform API. Connects residents with home chefs inside a housing society and handles rider-based delivery.",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Authentication — register, login, logout, token refresh",
      },
      { name: "Users", description: "User profile & location management" },
      { name: "Societies", description: "Housing society management" },
      { name: "Dishes", description: "Chef dish management & analytics" },
      { name: "Feed", description: "Resident dish feed with filters" },
      { name: "Orders", description: "Order placement & management" },
      {
        name: "Rider",
        description: "Rider availability & order delivery workflow",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "__auth_at",
          description:
            "HTTP-only access token cookie set automatically on login/refresh. Include credentials with every request.",
        },
      },
      schemas: {
        Role: {
          type: "string",
          enum: ["CHEF", "RESIDENT", "RIDER"],
          description: "User role within the platform",
        },
        OrderStatus: {
          type: "string",
          enum: [
            "PENDING",
            "ASSIGNED",
            "ACCEPTED",
            "PICKED_UP",
            "DELIVERED",
            "CANCELLED",
          ],
        },
        MealSlot: {
          type: "string",
          enum: ["BREAKFAST", "LUNCH", "DINNER", "ANY"],
        },

        Society: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Green Valley Residency" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Priya Sharma" },
            email: {
              type: "string",
              format: "email",
              example: "priya@example.com",
            },
            role: { $ref: "#/components/schemas/Role" },
            societyId: { type: "string", format: "uuid" },
            isAvailable: { type: "boolean", example: false },
            lat: { type: "number", nullable: true, example: 25.5941 },
            lng: { type: "number", nullable: true, example: 85.1376 },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Dish: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Dal Makhani" },
            price: { type: "number", example: 120 },
            quantity: { type: "integer", example: 10 },
            mediaUrl: {
              type: "string",
              nullable: true,
              example: "https://cdn.example.com/dal.jpg",
            },
            calories: { type: "integer", nullable: true, example: 350 },
            healthScore: { type: "number", nullable: true, example: 7.5 },
            isVeg: { type: "boolean", example: true },
            tags: {
              type: "array",
              items: { type: "string" },
              example: ["spicy", "high-protein"],
            },
            isSoldOut: { type: "boolean", example: false },
            mealSlot: { $ref: "#/components/schemas/MealSlot" },
            chefId: { type: "string", format: "uuid" },
            societyId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            status: { $ref: "#/components/schemas/OrderStatus" },
            dishId: { type: "string", format: "uuid" },
            customerId: { type: "string", format: "uuid" },
            riderId: { type: "string", format: "uuid", nullable: true },
            societyId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ChefAnalytics: {
          type: "object",
          properties: {
            totalDishes: { type: "integer", example: 5 },
            totalOrders: { type: "integer", example: 42 },
            totalRevenue: { type: "number", example: 5040 },
            soldOutDishes: { type: "integer", example: 1 },
          },
        },

        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "An error occurred" },
            error: { nullable: true },
          },
        },
      },
    },
  },
  apis: ["./src/index.ts", "./src/modules/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
