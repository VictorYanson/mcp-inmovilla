import { z } from "zod";
import { MCPTool } from "mcp-framework";

interface GetPropertyInput {
    cod_ofer?: number;
    ref?: string;
}

class GetPropertyTool extends MCPTool<GetPropertyInput> {
    name = "get_property";
    description = "Get property details by offer code or reference";
    schema = {
        cod_ofer: {
            type: z.number().optional(),
            description: "Unique identifier of the property (Priority: High)",
        },
        ref: {
            type: z.string().optional(),
            description: "Public reference of the property (Priority: Low)",
        },
    };

    async execute({ cod_ofer, ref }: GetPropertyInput) {
        if (!cod_ofer && !ref) {
            throw new Error("Either 'cod_ofer' or 'ref' must be provided");
        }

        let url = "https://procesos.inmovilla.com/api/v1/propiedades/?";
        const params = new URLSearchParams();
        if (cod_ofer) params.append("cod_ofer", cod_ofer.toString());
        if (ref) params.append("ref", ref);

        url += params.toString();

        const token = process.env.INMOVILLA_API_TOKEN;

        if (!token) {
            throw new Error("INMOVILLA_API_TOKEN environment variable is not set");
        }

        console.log("calling API GET /propiedades/?")

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

export default GetPropertyTool;
