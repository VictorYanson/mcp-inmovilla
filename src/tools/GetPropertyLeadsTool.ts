import { z } from "zod";
import { MCPTool } from "mcp-framework";

interface GetPropertyLeadsInput {
    dateStart: string;
    dateEnd: string;
    page?: number;
}

class GetPropertyLeadsTool extends MCPTool<GetPropertyLeadsInput> {
    name = "get_property_leads";
    description = "Get leads for properties within a date range";
    schema = {
        dateStart: {
            type: z.string(),
            description: "Start date for leads (YYYY-MM-DD)",
        },
        dateEnd: {
            type: z.string(),
            description: "End date for leads (YYYY-MM-DD)",
        },
        page: {
            type: z.number().optional(),
            description: "Page number for pagination",
        },
    };

    async execute({ dateStart, dateEnd, page }: GetPropertyLeadsInput) {
        let url = "https://procesos.inmovilla.com/api/v1/propiedades/?leads&";
        const params = new URLSearchParams();
        params.append("dateStart", dateStart);
        params.append("dateEnd", dateEnd);
        if (page) params.append("page", page.toString());

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

export default GetPropertyLeadsTool;
