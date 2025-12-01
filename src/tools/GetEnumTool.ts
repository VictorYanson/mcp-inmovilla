import { z } from "zod";
import { MCPTool } from "mcp-framework";

interface GetEnumInput {
    type: "calidades" | "tipos" | "paises" | "ciudades" | "zonas";
    param?: string;
}

class GetEnumTool extends MCPTool<GetEnumInput> {
    name = "get_enum";
    description = "Get enum values for various categories (calidades, tipos, paises, ciudades, zonas)";
    schema = {
        type: {
            type: z.enum(["calidades", "tipos", "paises", "ciudades", "zonas"]),
            description: "The type of enum to retrieve",
        },
        param: {
            type: z.string().optional(),
            description: "Optional parameter for specific queries (e.g., specific type, country code for cities, city code for zones)",
        },
    };

    async execute({ type, param }: GetEnumInput) {
        let url = `https://procesos.inmovilla.com/api/v1/enums/?${type}`;
        if (param) {
            url += `=${param}`;
        }

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

export default GetEnumTool;
