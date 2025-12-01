import { z } from "zod";
import { MCPTool } from "mcp-framework";

interface SearchClientsInput {
    telefono?: string;
    email?: string;
}

class SearchClientsTool extends MCPTool<SearchClientsInput> {
    name = "search_clients";
    description = "Search for clients by phone number or email";
    schema = {
        telefono: {
            type: z.string().optional(),
            description: "Phone number to search for",
        },
        email: {
            type: z.string().email().optional(),
            description: "Email address to search for",
        },
    };

    async execute({ telefono, email }: SearchClientsInput) {
        if (!telefono && !email) {
            throw new Error("Either 'telefono' or 'email' must be provided");
        }

        let url = "https://procesos.inmovilla.com/api/v1/clientes/buscar/?";
        const params = new URLSearchParams();
        if (telefono) params.append("telefono", telefono);
        if (email) params.append("email", email);

        url += params.toString();

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

export default SearchClientsTool;
