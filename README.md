# GA4 MCP Server

This project sets up a Model Context Protocol (MCP) server that connects to Google Analytics 4 (GA4) using the `@modelcontextprotocol/sdk` and the `@google-analytics/data` library. It exposes several GA4 analytics tools to be used with applications like Claude Desktop.

## Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd ga4-mcp-server
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Google Service Account Key:**

    Obtain a Google service account key in JSON format and place it in the project root. Rename the file to `service-account-key.json` (or update the `.env` file accordingly).

4.  **Environment Variables:**

    Create a `.env` file in the project root with the following content:

    ```
    GOOGLE_APPLICATION_CREDENTIALS="./service-account-key.json"
    GA_PROPERTY_ID="YOUR_GA_PROPERTY_ID"
    ```

    Replace `"YOUR_GA_PROPERTY_ID"` with your actual Google Analytics 4 Property ID.

5.  **Configure Claude Desktop (or other MCP-compatible application):**

    Ensure your Claude Desktop configuration (`claude_desktop_config.json`) includes the necessary environment variables and points to the `src/index.js` file for the MCP server. An example configuration snippet:

    ```json
    {
      "mcp_servers": [
        {
          "id": "ga4-analytics",
          "name": "GA4 Analytics Server",
          "description": "Provides Google Analytics 4 data access.",
          "command": "node",
          "args": ["<PATH_TO_YOUR_REPO>/src/index.js"],
          "cwd": "<PATH_TO_YOUR_REPO>",
          "env": {
            "GOOGLE_APPLICATION_CREDENTIALS": "<PATH_TO_YOUR_REPO>/service-account-key.json",
            "GA_PROPERTY_ID": "YOUR_GA_PROPERTY_ID"
          }
        }
      ]
    }
    ```

    **Important:** Replace `<PATH_TO_YOUR_REPO>` with the absolute path to your `ga4-mcp-server` directory on your local machine.

    Similarly, update your `mcp.json` file if you are using it for tool definitions.

## Running the Server

To run the MCP server, execute the following command in your terminal:

```bash
node src/index.js
```

For background execution, you can use:

```bash
node src/index.js &
```

## Available Tools

This server exposes the following Google Analytics 4 tools, allowing you to retrieve various types of data from your GA4 property through the MCP interface:

| Tool Name           | Description                                                                                                                              | Purpose                                                                                                                                                                                                                                                                                                                                    | Suggested Prompt                                                                                                                                                                                                     |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query_analytics`   | Queries Google Analytics 4 data based on provided property ID, dimensions, metrics, and date ranges.                                       | This is a versatile tool for fetching custom reports by specifying dimensions (how your data is organized, e.g., country, device) and metrics (the actual data points, e.g., active users, sessions). It's ideal when you need to analyze specific data combinations that aren't covered by the other pre-defined tools.                         | "Get me the total users and sessions by country for the last 7 days." or "Query analytics data for page views and active users, broken down by device category."                                                    |
| `get_realtime_data` | Retrieves real-time active user data for your Google Analytics 4 property.                                                               | Use this tool to see what's happening on your website or app right now. It provides immediate insights into active users and other real-time metrics, which is crucial for monitoring live campaigns or sudden traffic changes.                                                                                                            | "What's the current number of active users on my site right now?" or "Show me real-time data for active users and new users."                                                                                        |
| `get_traffic_sources` | Retrieves traffic source data (e.g., channel, source, medium) for your Google Analytics 4 property.                                        | Understand where your users are coming from. This tool helps you analyze the effectiveness of your marketing channels (e.g., organic search, social, direct) and identify which sources are driving the most traffic and engagement.                                                                                                    | "Show me the traffic sources for the last month." or "What are the top 5 channels driving traffic to my website?"                                                                                                     |
| `get_user_demographics` | Retrieves user demographic data (e.g., country, city, device category) for your Google Analytics 4 property.                             | Gain insights into your audience's characteristics. This data can help you tailor your content, products, or services to specific user segments and understand the geographical distribution and device preferences of your users.                                                                                                | "What are the demographics of my users in terms of country and device category for the past 90 days?" or "Get user demographics including city and country."                                                           |
| `get_page_performance` | Retrieves page performance data (e.g., page path, page title, views) for your Google Analytics 4 property.                               | Evaluate the performance of individual pages or screens on your website/app. This helps identify popular content, areas that might need improvement, and understand user engagement with different parts of your site.                                                                                                                | "Show me the page performance for my top 10 pages over the last week." or "Which pages had the most views in the last 30 days?"                                                                                       |
| `get_conversion_data` | Retrieves conversion data for your Google Analytics 4 property.                                                                          | Track the success of your key business objectives. This tool allows you to see how many users are completing specific actions (conversions) like purchases, sign-ups, or form submissions, providing valuable data for ROI analysis and goal optimization.                                                                            | "Get conversion data for 'purchase' events over the last quarter." or "How many 'sign_up' conversions did I have last month?"                                                                                      |
| `get_custom_report` | Retrieves a custom report from Google Analytics 4 based on provided property ID, dimensions, metrics, and date ranges. This tool is similar to `query_analytics` but allows for more specific use cases where a custom tool might be preferred for clarity. | Similar to `query_analytics`, this tool provides flexibility for generating reports with specific dimensions and metrics. It can be used for highly customized data extraction beyond the standard reports, allowing for deep-dive analysis into user behavior and business performance. | "Create a custom report showing users by browser and operating system for the last year." or "I need a custom report with sessions, new users, and events by traffic source and device, for the last 6 months." |

## Contributing

Feel free to fork this repository and contribute to its development. 