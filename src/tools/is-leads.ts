/**
 * IS Lead (Inside Sales Lead) Tools for MCP
 *
 * 清原さん・一ツ矢さんがClaude Desktopから直接IS Leadを操作できるようにするツール群
 */

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TwentyClient } from '../client/twenty-client.js';

// フェーズのenum定義
const phaseEnum = z.enum(['VALID_REPLY', 'LOST', 'ON_HOLD', 'CONVERTED']);

// リードソースのenum定義
const leadSourceEnum = z.enum(['INSTAGRAM', 'EMAIL', 'HP', 'ALIBABA']);

export function registerIsLeadTools(server: McpServer, client: TwentyClient) {
  /**
   * create_is_lead - IS Leadを作成する
   *
   * 使用例:
   * - 「ABC Coffee、アメリカ、Instagramから。抹茶ラテ用、月50kg希望」
   * - 「新規リード: XYZ Tea House、タイ、HP経由」
   */
  server.tool(
    'create_is_lead',
    'Create a new IS Lead (Inside Sales Lead) in Twenty CRM. Use this to register new leads from Instagram, Email, HP, or Alibaba.',
    {
      name: z.string().describe('Company/Customer name (required)'),
      country: z.string().optional().describe('Country (e.g., USA, UK, Thailand, Japan)'),
      industry: z.string().optional().describe('Industry type (Retailer, Cafe/Restaurant, Manufacturer, Distributor)'),
      leadSource: leadSourceEnum.optional().describe('Lead source: INSTAGRAM, EMAIL, HP, or ALIBABA'),
      instagramAccount: z.string().optional().describe('Instagram account (e.g., @example)'),
      customerNeeds: z.string().optional().describe('Customer needs (e.g., matcha latte, ceremonial grade)'),
      quantity: z.number().optional().describe('Desired quantity in kg'),
      priceRangeMin: z.number().optional().describe('Minimum price range (JPY/kg)'),
      priceRangeMax: z.number().optional().describe('Maximum price range (JPY/kg)'),
      expectedRevenue: z.number().optional().describe('Expected revenue (JPY)'),
      phase: phaseEnum.optional().describe('Lead phase (default: VALID_REPLY)'),
      memo: z.string().optional().describe('Additional notes'),
    },
    async (args) => {
      try {
        const lead = await client.createIsLead({
          name: args.name,
          phase: args.phase || 'VALID_REPLY',
          country: args.country,
          industry: args.industry,
          leadSource: args.leadSource,
          instagramAccount: args.instagramAccount,
          customerNeeds: args.customerNeeds,
          quantity: args.quantity,
          priceRangeMin: args.priceRangeMin,
          priceRangeMax: args.priceRangeMax,
          expectedRevenue: args.expectedRevenue,
          memo: args.memo,
          lastContactDate: new Date().toISOString().split('T')[0], // 今日の日付
        });

        let summary = `IS Lead created: ${lead.name} (ID: ${lead.id})`;
        if (lead.country) summary += `\n- Country: ${lead.country}`;
        if (lead.leadSource) summary += `\n- Source: ${lead.leadSource}`;
        if (lead.customerNeeds) summary += `\n- Needs: ${lead.customerNeeds}`;
        if (lead.quantity) summary += `\n- Quantity: ${lead.quantity}kg`;
        if (lead.priceRangeMin || lead.priceRangeMax) {
          summary += `\n- Price range: ${lead.priceRangeMin || '?'} - ${lead.priceRangeMax || '?'} JPY/kg`;
        }

        return {
          content: [{
            type: 'text' as const,
            text: summary
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error creating IS Lead: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );

  /**
   * get_is_lead - IS LeadをIDで取得する
   */
  server.tool(
    'get_is_lead',
    'Get an IS Lead by ID from Twenty CRM',
    {
      id: z.string().describe('IS Lead ID to retrieve'),
    },
    async (args) => {
      try {
        const lead = await client.getIsLead(args.id);
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(lead, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error retrieving IS Lead: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );

  /**
   * update_is_lead - IS Leadを更新する
   *
   * 使用例:
   * - 「ABC Coffeeを失注に変更。理由は価格不一致」
   * - 「XYZ Tea Houseの希望数量を100kgに更新」
   */
  server.tool(
    'update_is_lead',
    'Update an existing IS Lead in Twenty CRM. Use this to change phase, update contact info, or record lost reasons.',
    {
      id: z.string().describe('IS Lead ID to update (required)'),
      name: z.string().optional().describe('Company/Customer name'),
      phase: phaseEnum.optional().describe('Lead phase: VALID_REPLY, LOST, ON_HOLD, CONVERTED'),
      country: z.string().optional().describe('Country'),
      industry: z.string().optional().describe('Industry type'),
      leadSource: leadSourceEnum.optional().describe('Lead source'),
      instagramAccount: z.string().optional().describe('Instagram account'),
      customerNeeds: z.string().optional().describe('Customer needs'),
      quantity: z.number().optional().describe('Desired quantity in kg'),
      priceRangeMin: z.number().optional().describe('Minimum price range (JPY/kg)'),
      priceRangeMax: z.number().optional().describe('Maximum price range (JPY/kg)'),
      expectedRevenue: z.number().optional().describe('Expected revenue (JPY)'),
      lostReason: z.string().optional().describe('Reason for losing the lead (use when phase is LOST)'),
      lastContactDate: z.string().optional().describe('Last contact date (YYYY-MM-DD)'),
      memo: z.string().optional().describe('Additional notes'),
    },
    async (args) => {
      try {
        const { id, ...updates } = args;

        // undefined値を除去
        const cleanUpdates = Object.fromEntries(
          Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        // 最終接触日を自動更新（明示的に指定されていない場合）
        if (!cleanUpdates.lastContactDate && Object.keys(cleanUpdates).length > 0) {
          cleanUpdates.lastContactDate = new Date().toISOString().split('T')[0];
        }

        const lead = await client.updateIsLead({ id, ...cleanUpdates });

        let summary = `IS Lead updated: ${lead.name}`;
        if (args.phase) summary += `\n- Phase: ${lead.phase}`;
        if (args.lostReason) summary += `\n- Lost reason: ${args.lostReason}`;
        if (args.quantity) summary += `\n- Quantity: ${args.quantity}kg`;

        return {
          content: [{
            type: 'text' as const,
            text: summary
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error updating IS Lead: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );

  /**
   * search_is_leads - IS Leadを検索する
   *
   * 使用例:
   * - 「Instagram経由のリードを一覧表示」
   * - 「アメリカのリードを検索」
   * - 「有効返信フェーズのリード一覧」
   */
  server.tool(
    'search_is_leads',
    'Search for IS Leads in Twenty CRM. Filter by phase, source, country, or search by name.',
    {
      query: z.string().optional().describe('Search query (searches by name)'),
      phase: phaseEnum.optional().describe('Filter by phase: VALID_REPLY, LOST, ON_HOLD, CONVERTED'),
      leadSource: leadSourceEnum.optional().describe('Filter by source: INSTAGRAM, EMAIL, HP, ALIBABA'),
      country: z.string().optional().describe('Filter by country'),
      limit: z.number().optional().default(20).describe('Maximum number of results (default: 20)'),
    },
    async (args) => {
      try {
        const leads = await client.searchIsLeads({
          query: args.query,
          phase: args.phase,
          leadSource: args.leadSource,
          country: args.country,
          limit: args.limit,
        });

        if (leads.length === 0) {
          return {
            content: [{
              type: 'text' as const,
              text: 'No IS Leads found matching the criteria.'
            }]
          };
        }

        let result = `Found ${leads.length} IS Leads:\n\n`;
        for (const lead of leads) {
          result += `- ${lead.name}`;
          if (lead.phase) result += ` [${lead.phase}]`;
          if (lead.country) result += ` (${lead.country})`;
          if (lead.leadSource) result += ` via ${lead.leadSource}`;
          result += `\n  ID: ${lead.id}`;
          if (lead.customerNeeds) result += `\n  Needs: ${lead.customerNeeds}`;
          if (lead.quantity) result += `\n  Qty: ${lead.quantity}kg`;
          result += '\n\n';
        }

        return {
          content: [{
            type: 'text' as const,
            text: result
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error searching IS Leads: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );

  /**
   * list_is_leads_by_phase - フェーズ別にIS Leadを一覧表示
   *
   * 使用例:
   * - 「フェーズ別のリード数を教えて」
   * - 「IS Leadの全体像を見せて」
   */
  server.tool(
    'list_is_leads_by_phase',
    'List all IS Leads grouped by phase. Shows count and names for each phase (VALID_REPLY, LOST, ON_HOLD, CONVERTED).',
    {},
    async () => {
      try {
        const byPhase = await client.listIsLeadsByPhase();

        let result = `IS Leads by Phase (Total: ${byPhase.totalCount})\n`;
        result += '='.repeat(40) + '\n\n';

        const phases = [
          { key: 'VALID_REPLY', label: 'Valid Reply (Active)' },
          { key: 'ON_HOLD', label: 'On Hold (Pending)' },
          { key: 'CONVERTED', label: 'Converted (Won)' },
          { key: 'LOST', label: 'Lost' },
        ];

        for (const { key, label } of phases) {
          const leads = byPhase[key as keyof typeof byPhase] as any[];
          if (Array.isArray(leads)) {
            result += `## ${label}: ${leads.length}\n`;
            if (leads.length > 0) {
              const displayLeads = leads.slice(0, 10);
              for (const lead of displayLeads) {
                result += `  - ${lead.name}`;
                if (lead.country) result += ` (${lead.country})`;
                result += '\n';
              }
              if (leads.length > 10) {
                result += `  ... and ${leads.length - 10} more\n`;
              }
            }
            result += '\n';
          }
        }

        return {
          content: [{
            type: 'text' as const,
            text: result
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error listing IS Leads by phase: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );

  /**
   * get_is_lead_stats - IS Leadの統計情報を取得
   *
   * 使用例:
   * - 「今週の有効返信数と離脱理由の内訳を教えて」
   * - 「国別のリード数を教えて」
   * - 「ソース別の成果を見せて」
   */
  server.tool(
    'get_is_lead_stats',
    'Get statistics for IS Leads. Shows counts by phase, source, country, and lost reasons.',
    {
      startDate: z.string().optional().describe('Start date for filtering (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('End date for filtering (YYYY-MM-DD)'),
    },
    async (args) => {
      try {
        const stats = await client.getIsLeadStats(args.startDate, args.endDate);

        let result = `IS Lead Statistics\n`;
        result += '='.repeat(40) + '\n';

        if (stats.period?.startDate || stats.period?.endDate) {
          result += `Period: ${stats.period.startDate || 'Beginning'} to ${stats.period.endDate || 'Now'}\n`;
        }
        result += `Total Leads: ${stats.totalLeads}\n\n`;

        // フェーズ別
        result += '## By Phase:\n';
        result += `  - Valid Reply: ${stats.byPhase.VALID_REPLY}\n`;
        result += `  - On Hold: ${stats.byPhase.ON_HOLD}\n`;
        result += `  - Converted: ${stats.byPhase.CONVERTED}\n`;
        result += `  - Lost: ${stats.byPhase.LOST}\n\n`;

        // ソース別
        if (Object.keys(stats.bySource).length > 0) {
          result += '## By Source:\n';
          for (const [source, count] of Object.entries(stats.bySource)) {
            result += `  - ${source}: ${count}\n`;
          }
          result += '\n';
        }

        // 国別（上位10件）
        if (Object.keys(stats.byCountry).length > 0) {
          result += '## By Country (Top 10):\n';
          const sortedCountries = Object.entries(stats.byCountry)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);
          for (const [country, count] of sortedCountries) {
            result += `  - ${country}: ${count}\n`;
          }
          result += '\n';
        }

        // 失注理由
        if (Object.keys(stats.lostReasons).length > 0) {
          result += '## Lost Reasons:\n';
          const sortedReasons = Object.entries(stats.lostReasons)
            .sort(([, a], [, b]) => b - a);
          for (const [reason, count] of sortedReasons) {
            result += `  - ${reason}: ${count}\n`;
          }
        }

        return {
          content: [{
            type: 'text' as const,
            text: result
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error getting IS Lead stats: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }
    }
  );
}
