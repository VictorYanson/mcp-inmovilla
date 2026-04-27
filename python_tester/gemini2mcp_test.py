import asyncio
import os
import json
import sys
from dotenv import load_dotenv
import google.generativeai as genai
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
from mcp.types import CallToolResult

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY not found in .env file")
    sys.exit(1)

MCP_API_KEY = os.getenv("MCP_API_KEY")
if not MCP_API_KEY:
    print("Error: MCP_API_KEY not found in .env file")
    sys.exit(1)

MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "https://mcp-inmovilla-production.up.railway.app/mcp")

# Configure Gemini client
genai.configure(api_key=GEMINI_API_KEY)

async def main():
    print(f"Connecting to MCP server at {MCP_SERVER_URL}...")

    try:
        async with streamablehttp_client(MCP_SERVER_URL, headers={"X-API-Key": MCP_API_KEY}) as stream_context:
            read_stream, write_stream, _ = stream_context
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()

                print("Connected to MCP server!")

                # Get tools from MCP
                tools_result = await session.list_tools()
                mcp_tools = tools_result.tools
                print(f"Found {len(mcp_tools)} tools.")

                # Convert MCP tools to Gemini Function Declarations
                # Note: Gemini can often take the JSON schema directly
                gemini_tools_list = []
                for tool in mcp_tools:
                    gemini_tools_list.append({
                        "name": tool.name,
                        "description": tool.description,
                        "parameters": tool.inputSchema,
                    })

                # Initialize the Model with tools and system instruction
                model = genai.GenerativeModel(
                    model_name='gemini-2.5-flash',
                    tools=[{'function_declarations': gemini_tools_list}],
                    system_instruction=(
                        "You are a helpful real estate assistant with access to Inmovilla API tools. "
                        "1. Tool Chaining: Use search_cities to get key_loca, then get_enum for 'zonas'. "
                        "2. Data Retrieval: Use IDs from tool outputs for subsequent calls."
                    )
                )

                # Start a chat session
                chat = model.start_chat(enable_automatic_function_calling=False)

                print("\n--- Chat Session Started (type 'quit' to exit) ---")

                while True:
                    try:
                        user_input = input("\nYou: ")
                        if user_input.lower() in ["quit", "exit"]:
                            break

                        # Send message to Gemini
                        response = chat.send_message(user_input)

                        # Check for function calls in the response
                        while response.candidates[0].content.parts[0].function_call:
                            # We handle multiple potential calls in one turn
                            for part in response.candidates[0].content.parts:
                                if fn := part.function_call:
                                    fn_name = fn.name
                                    fn_args = dict(fn.args) # Convert to standard dict

                                    print(f"Calling tool: {fn_name} with args: {fn_args}")

                                    try:
                                        result: CallToolResult = await session.call_tool(fn_name, fn_args)
                                        
                                        # Process tool output
                                        tool_output_text = ""
                                        if not result.isError:
                                            for content in result.content:
                                                if content.type == "text":
                                                    tool_output_text += content.text
                                        else:
                                            tool_output_text = f"Error: {result.content}"
                                            
                                        print(f"Tool Output: {tool_output_text[:100]}...")

                                        # Send the tool result back to Gemini
                                        response = chat.send_message(
                                            genai.protos.Part(
                                                function_response=genai.protos.FunctionResponse(
                                                    name=fn_name,
                                                    response={'result': tool_output_text}
                                                )
                                            )
                                        )

                                    except Exception as e:
                                        print(f"Error executing tool {fn_name}: {e}")
                                        break
                            
                            # Break the while if no more function calls appear in the newest response
                            if not response.candidates[0].content.parts[0].function_call:
                                break

                        print(f"\nAI: {response.text}")

                    except KeyboardInterrupt:
                        print("\nExiting...")
                        break
                    except Exception as e:
                        print(f"\nError: {e}")

    except Exception as e:
        print(f"Failed to connect or run: {e}")

if __name__ == "__main__":
    asyncio.run(main())