import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { GoogleAuth } from 'google-auth-library';
import { z } from "zod";
import dotenv from 'dotenv';

// Temporarily override process.stdout.write to suppress dotenv output
const originalWrite = process.stdout.write;
process.stdout.write = (chunk, encoding, callback) => {
  // Suppress output by doing nothing
};

dotenv.config({ silent: true });

// Restore original process.stdout.write
process.stdout.write = originalWrite;

// Initialize Google Analytics Data Client
// Credentials will be loaded automatically via GOOGLE_APPLICATION_CREDENTIALS environment variable.
const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/analytics.readonly',
});

const analyticsDataClient = new BetaAnalyticsDataClient({ authClient: auth });

const server = new McpServer({
  name: "ga4-mcp-server",
  version: "1.0.0"
});

const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID;

// Generic tool to query Google Analytics data
server.registerTool(
  "query_analytics",
  {
    title: "Query Google Analytics Data",
    description: "Queries Google Analytics 4 data based on provided dimensions, metrics, and date ranges. The property ID is optional and defaults to the GA_PROPERTY_ID configured in your environment.",
    inputSchema: {
      propertyId: z.string().optional(),
      dimensions: z.array(z.string()).optional(),
      metrics: z.array(z.string()),
      startDate: z.string().optional(),
      endDate: z.string().optional()
    }
  },
  async ({ propertyId, dimensions, metrics, startDate, endDate }) => {
    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId || GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: startDate || '30daysAgo',
            endDate: endDate || 'today',
          },
        ],
        dimensions: dimensions ? dimensions.map(d => ({ name: d })) : [],
        metrics: metrics.map(m => ({ name: m })),
      });

      const rows = response.rows.map(row => {
        const dimensionValues = row.dimensionValues.map(dv => dv.value);
        const metricValues = row.metricValues.map(mv => mv.value);
        return [...dimensionValues, ...metricValues];
      });

      const header = [
        ...(dimensions || []),
        ...metrics
      ];

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ header, rows }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error querying analytics: ${error.message}` }],
        isError: true
      };
    }
  }
);

// Tool to get real-time data
server.registerTool(
  "get_realtime_data",
  {
    title: "Get Realtime Google Analytics Data",
    description: "Retrieves real-time active user data for your Google Analytics 4 property. The property ID is optional and defaults to the GA_PROPERTY_ID configured in your environment.",
    inputSchema: {
      propertyId: z.string().optional(),
      metrics: z.array(z.string())
    }
  },
  async ({ propertyId, metrics }) => {
    try {
      const [response] = await analyticsDataClient.runRealtimeReport({
        property: `properties/${propertyId || GA_PROPERTY_ID}`,
        metrics: (metrics && metrics.length > 0) ? metrics.map(m => ({ name: m })) : [{ name: 'activeUsers' }],
      });

      const rows = response.rows.map(row => {
        const metricValues = row.metricValues.map(mv => mv.value);
        return [...metricValues];
      });

      const header = (metrics && metrics.length > 0) ? metrics : ['activeUsers'];

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ header, rows }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error getting real-time data: ${error.message}` }],
        isError: true
      };
    }
  }
);

// Tool to get traffic sources
server.registerTool(
  "get_traffic_sources",
  {
    title: "Get Google Analytics Traffic Sources",
    description: "Retrieves traffic source data (e.g., channel, source, medium) for your Google Analytics 4 property. The property ID is optional and defaults to the GA_PROPERTY_ID configured in your environment.",
    inputSchema: {
      propertyId: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional()
    }
  },
  async ({ propertyId, startDate, endDate }) => {
    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId || GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: startDate || '30daysAgo',
            endDate: endDate || 'today',
          },
        ],
        dimensions: [
          { name: 'sessionDefaultChannelGroup' },
          { name: 'sessionSource' },
          { name: 'sessionMedium' }
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' }
        ],
      });

      const rows = response.rows.map(row => {
        const dimensionValues = row.dimensionValues.map(dv => dv.value);
        const metricValues = row.metricValues.map(mv => mv.value);
        return [...dimensionValues, ...metricValues];
      });

      const header = ['sessionDefaultChannelGroup', 'sessionSource', 'sessionMedium', 'sessions', 'totalUsers'];

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ header, rows }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error getting traffic sources: ${error.message}` }],
        isError: true
      };
    }
  }
);

// Tool to get user demographics
server.registerTool(
  "get_user_demographics",
  {
    title: "Get Google Analytics User Demographics",
    description: "Retrieves user demographic data (e.g., country, city, device category) for your Google Analytics 4 property. The property ID is optional and defaults to the GA_PROPERTY_ID configured in your environment.",
    inputSchema: {
      propertyId: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional()
    }
  },
  async ({ propertyId, startDate, endDate }) => {
    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId || GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: startDate || '30daysAgo',
            endDate: endDate || 'today',
          },
        ],
        dimensions: [
          { name: 'country' },
          { name: 'city' },
          { name: 'deviceCategory' }
        ],
        metrics: [
          { name: 'totalUsers' },
          { name: 'newUsers' }
        ],
      });

      const rows = response.rows.map(row => {
        const dimensionValues = row.dimensionValues.map(dv => dv.value);
        const metricValues = row.metricValues.map(mv => mv.value);
        return [...dimensionValues, ...metricValues];
      });

      const header = ['country', 'city', 'deviceCategory', 'totalUsers', 'newUsers'];

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ header, rows }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error getting user demographics: ${error.message}` }],
        isError: true
      };
    }
  }
);

// Tool to get page performance
server.registerTool(
  "get_page_performance",
  {
    title: "Get Google Analytics Page Performance",
    description: "Retrieves page performance data (e.g., page path, page title, views) for your Google Analytics 4 property. The property ID is optional and defaults to the GA_PROPERTY_ID configured in your environment.",
    inputSchema: {
      propertyId: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional()
    }
  },
  async ({ propertyId, startDate, endDate }) => {
    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId || GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: startDate || '30daysAgo',
            endDate: endDate || 'today',
          },
        ],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' }
        ],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'activeUsers' }
        ],
      });

      const rows = response.rows.map(row => {
        const dimensionValues = row.dimensionValues.map(dv => dv.value);
        const metricValues = row.metricValues.map(mv => mv.value);
        return [...dimensionValues, ...metricValues];
      });

      const header = ['pagePath', 'pageTitle', 'screenPageViews', 'activeUsers'];

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ header, rows }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error getting page performance: ${error.message}` }],
        isError: true
      };
    }
  }
);

// Tool to get key event data
server.registerTool(
  "get_key_event_data",
  {
    title: "Get Google Analytics Key Event Data",
    description: "Retrieves key event data for your Google Analytics 4 property. The property ID is optional and defaults to the GA_PROPERTY_ID configured in your environment.",
    inputSchema: {
      propertyId: z.string().optional(),
      keyEvent: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional()
    }
  },
  async ({ propertyId, keyEvent, startDate, endDate }) => {
    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId || GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: startDate || '30daysAgo',
            endDate: endDate || 'today',
          },
        ],
        dimensions: [
          { name: 'eventName' }
        ],
        metrics: [
          { name: 'keyEvents' }
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: {
              value: keyEvent,
              matchType: 'EXACT'
            }
          }
        }
      });

      const rows = response.rows.map(row => {
        const dimensionValues = row.dimensionValues.map(dv => dv.value);
        const metricValues = row.metricValues.map(mv => mv.value);
        return [...dimensionValues, ...metricValues];
      });

      const header = ['eventName', 'keyEvents'];

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ header, rows }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error getting key event data: ${error.message}` }],
        isError: true
      };
    }
  }
);

// Tool to get custom report
server.registerTool(
  "get_custom_report",
  {
    title: "Get Custom Google Analytics Report",
    description: "Retrieves a custom report from Google Analytics 4 based on provided dimensions, metrics, and date ranges. The property ID is optional and defaults to the GA_PROPERTY_ID configured in your environment.",
    inputSchema: {
      propertyId: z.string().optional(),
      dimensions: z.array(z.string()).optional(),
      metrics: z.array(z.string()),
      startDate: z.string().optional(),
      endDate: z.string().optional()
    }
  },
  async ({ propertyId, dimensions, metrics, startDate, endDate }) => {
    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId || GA_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: startDate || '30daysAgo',
            endDate: endDate || 'today',
          },
        ],
        dimensions: dimensions ? dimensions.map(d => ({ name: d })) : [],
        metrics: metrics.map(m => ({ name: m })),
      });

      const rows = response.rows.map(row => {
        const dimensionValues = row.dimensionValues.map(dv => dv.value);
        const metricValues = row.metricValues.map(mv => mv.value);
        return [...dimensionValues, ...metricValues];
      });

      const header = [
        ...(dimensions || []),
        ...metrics
      ];

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ header, rows }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error getting custom report: ${error.message}` }],
        isError: true
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // console.log("GA4 MCP Server is up and running."); // Removed this line to prevent non-JSON output
}

main();