import asyncio
import os
import json
import sys
from typing import Optional
from contextlib import AsyncExitStack

from dotenv import load_dotenv
from openai import AsyncOpenAI
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
from mcp.types import CallToolResult

# Load environment variables
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY not found in .env file")
    sys.exit(1)

MCP_SERVER_URL = "http://localhost:1337/mcp"

async def main():
    # Initialize OpenAI client
    client = AsyncOpenAI(api_key=OPENAI_API_KEY)

    print(f"Connecting to MCP server at {MCP_SERVER_URL}...")

    try:
        async with AsyncExitStack() as stack:
            # Connect to MCP server via Streamable HTTP
            # streamablehttp_client returns (read_stream, write_stream, session_id)
            read_stream, write_stream, _ = await stack.enter_async_context(
                streamablehttp_client(MCP_SERVER_URL)
            )

            session = await stack.enter_async_context(
                ClientSession(read_stream, write_stream)
            )
            
            await session.initialize()
            
            print("Connected to MCP server!")
            
            # List available tools
            tools_result = await session.list_tools()
            mcp_tools = tools_result.tools
            print(f"Found {len(mcp_tools)} tools:")
            for t in mcp_tools:
                print(f"  - {t.name}: {t.description}")

            # Convert MCP tools to OpenAI tools format
            openai_tools = []
            for tool in mcp_tools:
                openai_tools.append({
                    "type": "function",
                    "function": {
                        "name": tool.name,
                        "description": tool.description,
                        "parameters": tool.inputSchema
                    }
                })

            messages = [
                {"role": "system", "content": "You are a helpful assistant with access to tools. Use them when needed."}
            ]

            print("\n--- Chat Session Started (type 'quit' to exit) ---")

            while True:
                try:
                    user_input = input("\nYou: ")
                    if user_input.lower() in ['quit', 'exit']:
                        break
                    
                    messages.append({"role": "user", "content": user_input})

                    # Call OpenAI
                    response = await client.chat.completions.create(
                        model="gpt-4o",
                        messages=messages,
                        tools=openai_tools if openai_tools else None,
                        tool_choice="auto" if openai_tools else None
                    )

                    response_message = response.choices[0].message
                    messages.append(response_message)

                    if response_message.tool_calls:
                        print(f"\nAI wants to call {len(response_message.tool_calls)} tool(s)...")
                        
                        for tool_call in response_message.tool_calls:
                            function_name = tool_call.function.name
                            function_args = json.loads(tool_call.function.arguments)
                            
                            print(f"Calling tool: {function_name} with args: {function_args}")
                            
                            # Execute tool on MCP server
                            result: CallToolResult = await session.call_tool(
                                function_name,
                                function_args
                            )
                            
                            # Format result for OpenAI
                            # MCP returns a list of content (TextContent or ImageContent)
                            # We'll concatenate text content for simplicity
                            tool_output = ""
                            if not result.isError:
                                for content in result.content:
                                    if content.type == "text":
                                        tool_output += content.text
                                    elif content.type == "image":
                                        tool_output += "[Image content returned]"
                            else:
                                tool_output = f"Error: {result.content}"

                            print(f"Tool Output: {tool_output[:100]}..." if len(tool_output) > 100 else f"Tool Output: {tool_output}")

                            messages.append({
                                "tool_call_id": tool_call.id,
                                "role": "tool",
                                "name": function_name,
                                "content": tool_output,
                            })

                        # Get final response from OpenAI after tool outputs
                        second_response = await client.chat.completions.create(
                            model="gpt-4o",
                            messages=messages
                        )
                        final_reply = second_response.choices[0].message.content
                        print(f"\nAI: {final_reply}")
                        messages.append(second_response.choices[0].message)
                    
                    else:
                        print(f"\nAI: {response_message.content}")

                except KeyboardInterrupt:
                    print("\nExiting...")
                    break
                except Exception as e:
                    print(f"\nError: {e}")

    except Exception as e:
        print(f"Failed to connect or run: {e}")

if __name__ == "__main__":
    asyncio.run(main())
