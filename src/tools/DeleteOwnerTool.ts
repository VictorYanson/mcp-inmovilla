import { z } from "zod";
import { MCPTool } from "mcp-framework";

interface DeleteOwnerInput {
    cod_cli: number;
}

class DeleteOwnerTool extends MCPTool<DeleteOwnerInput> {
    name = "delete_owner";
    description = "Delete an owner from Inmovilla";
    schema = {
        cod_cli: {
            type: z.number(),
            description: "Unique identifier of the owner to delete",
        },
    };

    async execute({ cod_cli }: DeleteOwnerInput) {
        const url = `https://procesos.inmovilla.com/api/v1/propietarios/${cod_cli}`;
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

export default DeleteOwnerTool;
