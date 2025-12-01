# mcp-inmovilla

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that provides tools to interact with the Inmovilla API. This server enables LLMs to manage properties, clients, owners, and retrieve various enumerations from the Inmovilla real estate platform.

## About MCP

The Model Context Protocol (MCP) is an open protocol that enables seamless integration between LLM applications and external data sources and tools. Learn more:

- [MCP Framework GitHub](https://github.com/QuantGeekDev/mcp-framework)
- [MCP Framework Documentation](https://mcp-framework.com)
- [MCP Specification](https://modelcontextprotocol.io)

## Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd mcp-inmovilla
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```env
INMOVILLA_API_TOKEN=your_inmovilla_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

#### Obtaining the Inmovilla API Token

To get your Inmovilla API token:

1. Log in to [Inmovilla CRM](https://crm.inmovilla.com/panel)
2. Navigate to **Ajustes > Opciones > Token para API Rest**
3. Generate your token
4. Copy the token to your `.env` file

> **Note**: Tokens will automatically expire after 3 months of inactivity.

#### Obtaining the OpenAI API Key

1. Sign up or log in to [OpenAI Platform](https://platform.openai.com)
2. Navigate to API keys section
3. Create a new API key
4. Copy the key to your `.env` file

### 4. Start the Server

```bash
npm start
```

The MCP server will start on port 1337 at `http://localhost:1337/mcp`.

## Project Structure

```
mcp-inmovilla/
├── src/
│   ├── tools/              # MCP Tools for Inmovilla API
│   │   ├── CreateClientTool.ts
│   │   ├── CreateOwnerTool.ts
│   │   ├── CreatePropertyTool.ts
│   │   ├── DeleteClientTool.ts
│   │   ├── DeleteOwnerTool.ts
│   │   ├── GetClientTool.ts
│   │   ├── GetEnumTool.ts
│   │   ├── GetOwnerTool.ts
│   │   ├── GetPropertyExtraInfoTool.ts
│   │   ├── GetPropertyLeadsTool.ts
│   │   ├── GetPropertyTool.ts
│   │   ├── ListPropertiesTool.ts
│   │   ├── SearchClientsTool.ts
│   │   ├── UpdateClientTool.ts
│   │   ├── UpdateOwnerTool.ts
│   │   └── UpdatePropertyTool.ts
│   └── index.ts            # Server entry point
├── python_tester/          # Python client for testing
│   ├── openai2mcp_test.py  # OpenAI chatbot client
│   └── requirements.txt    # Python dependencies
├── package.json
├── tsconfig.json
├── .env                    # Environment variables (create this)
└── README.md
```

## Python Testing Client

The `python_tester` folder contains a Python script that connects to the MCP server and allows you to interact with it using an OpenAI-powered chatbot.

### Setup

1. **Ensure the MCP server is running** (see step 4 above)

2. **Install Python dependencies**:
   ```bash
   cd python_tester
   pip install -r requirements.txt
   ```

3. **Run the chatbot**:
   ```bash
   python3 openai2mcp_test.py
   ```

### How It Works

The Python client:
- Connects to the MCP server via Streamable HTTP on `http://localhost:1337/mcp`
- Uses the OpenAI API (GPT-4) to process natural language queries
- Automatically discovers and calls available MCP tools
- Provides a console-based chat interface

### Example Usage

```
You: List all available properties
AI: [Calls list_properties tool and returns results]

You: Get information about property with reference ABC123
AI: [Calls get_property tool with the reference and returns property details]

You: What types of properties are available?
AI: [Calls get_enum tool for property types and returns the list]
```

Type `quit` or `exit` to end the chat session.

## Available Tools

The MCP server provides the following tools for interacting with the Inmovilla API:

### Properties
- `create_property` - Create a new property or prospect
- `get_property` - Get property details by code or reference
- `get_property_extra_info` - Get extra information (portal publication info, leads)
- `get_property_leads` - Get leads for properties within a date range
- `list_properties` - List all properties
- `update_property` - Update an existing property

### Clients
- `create_client` - Create a new client
- `get_client` - Get client details by code
- `search_clients` - Search for clients
- `update_client` - Update an existing client
- `delete_client` - Delete a client

### Owners
- `create_owner` - Create a new owner
- `get_owner` - Get owner details
- `update_owner` - Update an existing owner
- `delete_owner` - Delete an owner

### Enumerations
- `get_enum` - Get enum values for various categories (calidades, tipos, paises, ciudades, zonas)

## Development

### Watch Mode

To automatically rebuild on file changes:

```bash
npm run watch
```

### Adding New Tools

Tools are automatically loaded from the `src/tools/` directory. Each tool extends the `MCPTool` class and defines:
- `name` - Tool identifier
- `description` - What the tool does
- `schema` - Input parameters using Zod
- `execute()` - Tool implementation

## API Documentation

For detailed information about the Inmovilla API endpoints and parameters, refer to `Documentación API REST v1.html` in the project root.

## License

[Your License Here]
