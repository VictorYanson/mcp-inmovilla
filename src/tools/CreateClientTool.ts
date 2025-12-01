import { z } from "zod";
import { MCPTool } from "mcp-framework";

interface CreateClientInput {
    nombre: string;
    apellidos?: string;
    nif?: string;
    email?: string;
    telefono1?: number;
    telefono2?: number;
    calle?: string;
    numero?: string;
    planta?: string;
    puerta?: string;
    escalera?: string;
    cp?: string;
    localidad?: string;
    provincia?: string;
    pais?: string;
    nacionalidad?: string;
}

interface CreateClientResponse {
    cod_cli: number;
    codigo: number;
    mensaje: string;
}

class CreateClientTool extends MCPTool<CreateClientInput> {
    name = "create_client";
    description = "Create a new client in Inmovilla";
    schema = {
        nombre: {
            type: z.string(),
            description: "Name of the client",
        },
        apellidos: {
            type: z.string().optional(),
            description: "Surnames of the client",
        },
        nif: {
            type: z.string().optional(),
            description: "NIF/DNI/CIF of the client",
        },
        email: {
            type: z.string().email().optional(),
            description: "Email address of the client",
        },
        telefono1: {
            type: z.number().optional(),
            description: "Primary phone number",
        },
        telefono2: {
            type: z.number().optional(),
            description: "Secondary phone number",
        },
        calle: {
            type: z.string().optional(),
            description: "Street name",
        },
        numero: {
            type: z.string().optional(),
            description: "Street number",
        },
        planta: {
            type: z.string().optional(),
            description: "Floor number",
        },
        puerta: {
            type: z.string().optional(),
            description: "Door number",
        },
        escalera: {
            type: z.string().optional(),
            description: "Staircase",
        },
        cp: {
            type: z.string().optional(),
            description: "Postal code",
        },
        localidad: {
            type: z.string().optional(),
            description: "City/Locality",
        },
        provincia: {
            type: z.string().optional(),
            description: "Province",
        },
        pais: {
            type: z.string().optional(),
            description: "Country",
        },
        nacionalidad: {
            type: z.string().optional(),
            description: "Nationality",
        },
    };

    async execute(input: CreateClientInput) {
        const url = "https://procesos.inmovilla.com/api/v1/clientes/";
        const token = process.env.INMOVILLA_API_TOKEN;

        if (!token) {
            throw new Error("INMOVILLA_API_TOKEN environment variable is not set");
        }

        const response = await this.fetch<CreateClientResponse>(url, {
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

export default CreateClientTool;
