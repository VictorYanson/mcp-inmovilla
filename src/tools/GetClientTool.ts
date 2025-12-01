import { z } from "zod";
import { MCPTool } from "mcp-framework";

interface GetClientInput {
    cod_cli: number;
}

class GetClientTool extends MCPTool<GetClientInput> {
    name = "get_client";
    description = "Get a client by their unique code";
    schema = {
        cod_cli: {
            type: z.number(),
            description: "Unique identifier of the client",
        },
    };

    async execute({ cod_cli }: GetClientInput) {
        const url = `https://procesos.inmovilla.com/api/v1/clientes/?cod_cli=${cod_cli}`;
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

export default GetClientTool;
