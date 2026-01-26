import { z } from "zod";
import { MCPTool } from "mcp-framework";

interface CreatePropertyInput {
    ref: string;
    keyacci: number;
    key_tipo: number;
    key_loca: string;
    nodisponible?: boolean;
    precioinmo?: number;
    banyos?: number;
    habitaciones?: number;
    prospecto?: boolean;
    fotos?: Record<string, { url: string; posicion?: number }>;
    [key: string]: any; // Allow other optional fields
}

class CreatePropertyTool extends MCPTool<CreatePropertyInput> {
    name = "create_property";
    description = "Create a new property or prospect in Inmovilla";
    schema = {
        ref: {
            type: z.string(),
            description: "Reference of the property (Must be unique)",
        },
        keyacci: {
            type: z.number(),
            description: "Operation type ID",
        },
        key_tipo: {
            type: z.number(),
            description: "Property type ID",
        },
        key_loca: {
            type: z.string(),
            description: "City/Locality code",
        },
        nodisponible: {
            type: z.boolean().optional(),
            description: "If the property is not available",
        },
        precioinmo: {
            type: z.number().optional(),
            description: "Price for the agency",
        },
        banyos: {
            type: z.number().optional(),
            description: "Number of bathrooms",
        },
        habitaciones: {
            type: z.number().optional(),
            description: "Number of rooms",
        },
        prospecto: {
            type: z.boolean().optional(),
            description: "Set to true to create as a prospect",
        },
        fotos: {
            type: z.record(z.object({
                url: z.string(),
                posicion: z.number().optional(),
            })).optional(),
            description: "Object containing photo URLs",
        },
    };

    async execute(input: CreatePropertyInput) {
        const url = "https://procesos.inmovilla.com/api/v1/propiedades/";
        const token = process.env.INMOVILLA_API_TOKEN;

        if (!token) {
            throw new Error("INMOVILLA_API_TOKEN environment variable is not set");
        }

        console.log("calling api POST /propiedades/")

        const response = await this.fetch<any>(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Token": token,
            },
            body: JSON.stringify(input),
        });

        return response;
    }
}

export default CreatePropertyTool;
