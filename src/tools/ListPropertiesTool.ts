import { z } from "zod";
import { MCPTool } from "mcp-framework";

interface ListPropertiesInput {
    // No input parameters required for listing
}

class ListPropertiesTool extends MCPTool<ListPropertiesInput> {
    name = "list_properties";
    description = "List properties and prospects ordered by update date";
    schema = {};

    async execute() {
        const url = "https://procesos.inmovilla.com/api/v1/propiedades/?listado";
        const token = process.env.INMOVILLA_API_TOKEN;

        if (!token) {
            throw new Error("INMOVILLA_API_TOKEN environment variable is not set");
        }

        const response = await this.fetch<any>(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Token": token,
            },
        });

        return response;
    }
}

export default ListPropertiesTool;
