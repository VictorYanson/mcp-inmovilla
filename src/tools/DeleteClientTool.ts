import { z } from "zod";
import { MCPTool } from "mcp-framework";

interface DeleteClientInput {
    cod_cli: number;
}

class DeleteClientTool extends MCPTool<DeleteClientInput> {
    name = "delete_client";
    description = "Delete a client from Inmovilla";
    schema = {
        cod_cli: {
            type: z.number(),
            description: "Unique identifier of the client to delete",
        },
    };

    async execute({ cod_cli }: DeleteClientInput) {
        const url = `https://procesos.inmovilla.com/api/v1/clientes/${cod_cli}`;
        const token = process.env.INMOVILLA_API_TOKEN;

        if (!token) {
            throw new Error("INMOVILLA_API_TOKEN environment variable is not set");
        }

        const response = await this.fetch<any>(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Token": token,
            },
        });

        return response;
    }
}

export default DeleteClientTool;
