import { z } from "zod";
import { MCPTool } from "mcp-framework";

interface GetOwnerInput {
    cod_cli?: number;
    cod_ofer?: number;
    ref?: string;
}

class GetOwnerTool extends MCPTool<GetOwnerInput> {
    name = "get_owner";
    description = "Get owner details by client code, property code, or reference";
    schema = {
        cod_cli: {
            type: z.number().optional(),
            description: "Unique identifier of the owner (Priority: High)",
        },
        cod_ofer: {
            type: z.number().optional(),
            description: "Unique identifier of the property (Priority: Medium)",
        },
        ref: {
            type: z.string().optional(),
            description: "Public reference of the property (Priority: Low)",
        },
    };

    async execute({ cod_cli, cod_ofer, ref }: GetOwnerInput) {
        if (!cod_cli && !cod_ofer && !ref) {
            throw new Error("Either 'cod_cli', 'cod_ofer', or 'ref' must be provided");
        }

        let url = "https://procesos.inmovilla.com/api/v1/propietarios/?";
        const params = new URLSearchParams();
        if (cod_cli) params.append("cod_cli", cod_cli.toString());
        if (cod_ofer) params.append("cod_ofer", cod_ofer.toString());
        if (ref) params.append("ref", ref);

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

export default GetOwnerTool;
