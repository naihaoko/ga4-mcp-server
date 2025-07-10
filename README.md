# GA4 MCP Server

This project sets up a Model Context Protocol (MCP) server that connects to Google Analytics 4 (GA4) using the `@modelcontextprotocol/sdk` and the `@google-analytics/data` library. It exposes several GA4 analytics tools to be used with applications like Claude Desktop.

## Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd ga4-mcp-server
    ```

2.  **Install dependencies:**

    If `package.json` does not exist, initialize it first:
    ```bash
    npm init -y
    ```

    Then, install the project's dependencies:
    ```bash
    npm install @modelcontextprotocol/sdk @google-analytics/data dotenv
    ```
    This command installs all necessary project dependencies, including the MCP SDK, Google Analytics Data library, and dotenv for environment variable management.

3.  **Google Service Account Key:**

    To authenticate with the Google Analytics Data API, you need a Google service account key. Follow these steps to obtain one:

    *   **Create a Service Account:**
        1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
        2.  Navigate to "IAM & Admin" > "Service Accounts".
        3.  Click "Create Service Account".
        4.  Provide a name for the service account and an optional description.
        5.  Click "Done".
    *   **Grant Permissions:**
        1.  After creating the service account, you'll need to grant it the necessary permissions to access your Google Analytics 4 data.
        2.  On the "Grant this service account access to project" step (or by editing the service account later), add the role **"Analytics Viewer"** to the service account. This role grants read-only access to Google Analytics data.
        3.  Click "Done".
    *   **Generate JSON Key:**
        1.  In the "Service Accounts" page, click on the newly created service account.
        2.  Go to the "Keys" tab.
        3.  Click "Add Key" > "Create new key".
        4.  Select "JSON" as the key type and click "Create".
        5.  A JSON file containing your service account key will be downloaded to your computer.
    *   **Save the Key File:**
        Place the downloaded JSON key file in the project root of this repository. Rename the file to `service-account-key.json` (or update the `.env` file accordingly if you choose a different name).

4.  **Environment Variables:**

    Create a `.env` file in the project root with the following content:

    ```
    GOOGLE_APPLICATION_CREDENTIALS="./service-account-key.json"
    GA_PROPERTY_ID="YOUR_GA_PROPERTY_ID"
    ```

    Replace `"YOUR_GA_PROPERTY_ID"` with your actual Google Analytics 4 Property ID.

    **How to find your GA4 Property ID:**
    1.  Go to your [Google Analytics](https://analytics.google.com/) account.
    2.  Select the desired GA4 property.
    3.  Navigate to "Admin" (the gear icon at the bottom left).
    4.  In the "Property" column, click on "Property settings".
    5.  Your GA4 Property ID will be displayed there (it's a numeric ID, e.g., `123456789`).

5.  **Configure MCP-compatible applications (e.g., Claude Desktop, Gemini CLI):**

    To integrate this MCP server with your preferred MCP-compatible application, you will need to add a configuration snippet to its settings file. The location and name of this file may vary (e.g., `claude_desktop_config.json` for Claude Desktop, or `~/.gemini/settings.json` for Gemini CLI).

    For more information on installing and using Gemini CLI, refer to its GitHub repository: [https://github.com/google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)

    For Claude Desktop, go to: [https://claude.ai/download](https://claude.ai/download)

    Locate your application's settings file and add the following JSON snippet under the `mcpServers` key. If the `mcpServers` key does not exist, you may need to create it.

    ```json
    {
      "mcpServers": {
        "ga4-analytics": {
          "name": "google_analytics",
          "command": "node",
          "args": ["<PATH_TO_YOUR_REPO>/src/index.js"],
          "cwd": "<PATH_TO_YOUR_REPO>",
          "env": {
            "GOOGLE_APPLICATION_CREDENTIALS": "<PATH_TO_YOUR_REPO>/service-account-key.json",
            "GA_PROPERTY_ID": "YOUR_GA_PROPERTY_ID"
          }
        }
      }
    }
    ```

    **Important:** Replace `<PATH_TO_YOUR_REPO>` with the absolute path to your `ga4-mcp-server` directory on your local machine.

    After adding the configuration, restart your MCP-compatible application (e.g., Claude Desktop, Gemini CLI) for the changes to take effect. You can then start using the GA4 MCP tools within your application.

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
| `get_key_event_data` | Retrieves key event data for your Google Analytics 4 property.                                                                          | Track the success of your key business objectives. This tool allows you to see how many users are completing specific actions (key events) like purchases, sign-ups, or form submissions, providing valuable data for ROI analysis and goal optimization.                                                                            | "Get key event data for 'view_phone_number' events over the last quarter." or "How many 'sign_up' key events did I have last month?"                                                                                      |
| `get_custom_report` | Retrieves a custom report from Google Analytics 4 based on provided property ID, dimensions, metrics, and date ranges. This tool is similar to `query_analytics` but allows for more specific use cases where a custom tool might be preferred for clarity. | Similar to `query_analytics`, this tool provides flexibility for generating reports with specific dimensions and metrics. It can be used for highly customized data extraction beyond the standard reports, allowing for deep-dive analysis into user behavior and business performance. | "Create a custom report showing users by browser and operating system for the last year." or "I need a custom report with sessions, new users, and events by traffic source and device, for the last 6 months." |

## Contributing

Feel free to fork this repository and contribute to its development. 