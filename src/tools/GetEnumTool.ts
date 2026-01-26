import { z } from "zod";
import { MCPTool } from "mcp-framework";

interface GetEnumInput {
    type: "calidades" | "tipos" | "paises" | "ciudades" | "zonas";
    param?: string;
}

class GetEnumTool extends MCPTool<GetEnumInput> {
    name = "get_enum";
    description = "Get enum values for various categories (calidades, tipos, paises, ciudades, zonas). For 'zonas' (neighborhoods), you MUST provide the city code (key_loca) in the 'param' field. You can find this code using the 'search_cities' tool.";
    schema = {
        type: {
            type: z.enum(["calidades", "tipos", "paises", "ciudades", "zonas"]),
            description: "The type of enum to retrieve. Use 'zonas' to find neighborhoods within a city.",
        },
        param: {
            type: z.string().optional(),
            description: "Optional parameter. For 'zonas', this MUST be the numeric 'key_loca' of the city.",
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

        console.log("calling api GET /enums/?type")

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
