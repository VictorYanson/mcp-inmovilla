import { z } from "zod";
import { MCPTool } from "mcp-framework";

interface ListPropertiesInput {
    limit?: number;
}

class ListPropertiesTool extends MCPTool<ListPropertiesInput> {
    name = "list_properties";
    description = "List properties and prospects. Use the 'limit' parameter to avoid hitting token limits if there are many properties.";
    schema = {
        limit: {
            type: z.number().optional(),
            description: "Maximum number of properties to return (default: 50)",
        },
    };

    async execute({ limit = 50 }: ListPropertiesInput) {
        const url = "https://procesos.inmovilla.com/api/v1/propiedades/?listado";
        const token = process.env.INMOVILLA_API_TOKEN;

        if (!token) {
            throw new Error("INMOVILLA_API_TOKEN environment variable is not set");
        }

        console.log("calling API GET /propiedades/?listado")

        const response = await this.fetch<any>(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Token": token,
            },
        });

        if (Array.isArray(response)) {
            return response.slice(0, limit);
        }

        return response;
    }
}

export default ListPropertiesTool;
