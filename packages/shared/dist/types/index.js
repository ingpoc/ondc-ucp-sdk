// src/types/mcp/schemas.ts
var ondcSearchTool = {
  name: "ondc_search",
  description: "Search for products and services on the ONDC network. Returns items matching category, location, and preferences.",
  inputSchema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        description: 'Product or service category to search (e.g., "grocery", "restaurant", "fashion")'
      },
      query: {
        type: "string",
        description: "Free-text search query for specific items or keywords"
      },
      location: {
        type: "object",
        description: "Search location for nearby providers",
        properties: {
          latitude: {
            type: "number",
            description: "Latitude coordinate",
            minimum: -90,
            maximum: 90
          },
          longitude: {
            type: "number",
            description: "Longitude coordinate",
            minimum: -180,
            maximum: 180
          },
          radius: {
            type: "number",
            description: "Search radius in meters (default: 5000)",
            minimum: 100,
            maximum: 5e4
          }
        },
        required: ["latitude", "longitude"]
      },
      preferences: {
        type: "object",
        description: "Search preferences for sorting and filtering",
        properties: {
          maxPrice: {
            type: "number",
            description: "Maximum price filter"
          },
          minRating: {
            type: "number",
            description: "Minimum rating filter (0-5)",
            minimum: 0,
            maximum: 5
          },
          sortBy: {
            type: "string",
            description: "Sort order for results",
            enum: ["price", "rating", "distance", "relevance"]
          }
        }
      },
      maxResults: {
        type: "number",
        description: "Maximum number of results to return (default: 10)",
        minimum: 1,
        maximum: 100
      },
      expandSearch: {
        type: "boolean",
        description: "Include providers outside search radius (default: false)"
      }
    },
    required: ["category"]
  }
};
var ondcCheckoutTool = {
  name: "ondc_checkout",
  description: "Initiate checkout for selected items. Creates a session and returns payment details.",
  inputSchema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        description: "Items to checkout",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Item ID from search results"
            },
            providerId: {
              type: "string",
              description: "Provider/seller ID"
            },
            quantity: {
              type: "number",
              description: "Quantity to order",
              minimum: 1
            }
          },
          required: ["id", "providerId", "quantity"]
        }
      },
      buyer: {
        type: "object",
        description: "Buyer information for delivery",
        properties: {
          name: {
            type: "string",
            description: "Buyer full name"
          },
          phone: {
            type: "string",
            description: "Contact phone number"
          },
          email: {
            type: "string",
            description: "Contact email (optional)",
            format: "email"
          },
          address: {
            type: "object",
            description: "Delivery address",
            properties: {
              street: {
                type: "string",
                description: "Street address"
              },
              city: {
                type: "string",
                description: "City name"
              },
              state: {
                type: "string",
                description: "State name"
              },
              postalCode: {
                type: "string",
                description: "Postal or ZIP code"
              },
              country: {
                type: "string",
                description: "Country name (optional)"
              }
            },
            required: ["street", "city", "state", "postalCode"]
          }
        },
        required: ["name", "phone", "address"]
      },
      fulfillmentOptionId: {
        type: "string",
        description: "Fulfillment option ID (optional, uses default if not specified)"
      },
      instructions: {
        type: "string",
        description: "Special delivery instructions (optional)"
      }
    },
    required: ["items", "buyer"]
  }
};
var ondcStatusTool = {
  name: "ondc_status",
  description: "Check the status of an existing ONDC order or session. Returns current status, tracking, and updates.",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "Session or order ID to check"
      }
    },
    required: ["sessionId"]
  }
};
var ondcCancelTool = {
  name: "ondc_cancel",
  description: "Cancel an existing ONDC order or session. Returns cancellation status and refund details.",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "Session or order ID to cancel"
      },
      reason: {
        type: "string",
        description: "Reason for cancellation"
      }
    },
    required: ["sessionId", "reason"]
  }
};
var allMCPTools = [
  ondcSearchTool,
  ondcCheckoutTool,
  ondcStatusTool,
  ondcCancelTool
];
export {
  allMCPTools,
  ondcCancelTool,
  ondcCheckoutTool,
  ondcSearchTool,
  ondcStatusTool
};
//# sourceMappingURL=index.js.map