import { z } from "zod";
import { MCPTool } from "mcp-framework";

interface SearchCitiesInput {
    pais?: string;
    query: string;
}

class SearchCitiesTool extends MCPTool<SearchCitiesInput> {
    name = "search_cities";
    description = "Search for cities in Inmovilla to find their city codes (key_loca). Use the 'key_loca' from the results as the 'param' for 'get_enum' with type='zonas' to find neighborhoods.";
    schema = {
        pais: {
            type: z.string().optional(),
            description: "Country code (default: 724 for Spain)",
        },
        query: {
            type: z.string(),
            description: "The name of the city to search for",
        },
    };

    async execute({ pais = "724", query }: SearchCitiesInput) {
        const url = `https://procesos.inmovilla.com/api/v1/enums/?ciudades=${pais}`;
        const token = process.env.INMOVILLA_API_TOKEN;

        if (!token) {
            throw new Error("INMOVILLA_API_TOKEN environment variable is not set");
        }

        console.log(`calling api GET /enums/?ciudades=${pais}`);

        const response = await this.fetch<any>(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Token": token,
            },
        });

        if (!Array.isArray(response)) {
            return response;
        }

        const allCities: { ciudad: string; provincia: string; key_loca: number }[] = [];

        response.forEach((p: any) => {
            if (p.ciudades) {
                // Handle both array and object formats for ciudades
                const citiesList = Array.isArray(p.ciudades)
                    ? p.ciudades
                    : Object.values(p.ciudades);

                citiesList.forEach((c: any) => {
                    if (c && typeof c === 'object' && c.ciudad) {
                        allCities.push({
                            ciudad: c.ciudad,
                            provincia: p.provincia,
                            key_loca: c.key_loca
                        });
                    }
                });
            }
        });

        const q = query.toLowerCase();
        const results = allCities.filter(c =>
            c.ciudad.toLowerCase().includes(q)
        );

        // Sort results: exact matches first, then partial matches
        results.sort((a, b) => {
            const aExact = a.ciudad.toLowerCase() === q;
            const bExact = b.ciudad.toLowerCase() === q;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return a.ciudad.localeCompare(b.ciudad);
        });

        return results;
    }
}

export default SearchCitiesTool;
