/**
 * IS Lead (Inside Sales Lead) Types for First Agri
 *
 * IS Leadはインサイドセールスチームが管理するリード情報です。
 * Instagram/Email/HP経由で獲得した見込み顧客を追跡します。
 */

// フェーズ定義
export type IsLeadPhase =
  | 'VALID_REPLY'    // 有効返信
  | 'LOST'           // 失注/離脱
  | 'ON_HOLD'        // 継続/保留
  | 'CONVERTED';     // 商談化

// リードソース定義
export type LeadSource =
  | 'INSTAGRAM'
  | 'EMAIL'
  | 'HP'
  | 'ALIBABA';

// 国（主要なもの）
export type Country =
  | 'Japan'
  | 'USA'
  | 'UK'
  | 'Germany'
  | 'France'
  | 'Thailand'
  | 'Singapore'
  | 'Australia'
  | 'Canada'
  | 'UAE'
  | 'Other';

// 業態
export type Industry =
  | 'Retailer'
  | 'Cafe/Restaurant'
  | 'Manufacturer'
  | 'Distributor'
  | 'Other';

/**
 * IS Lead本体の型定義
 */
export interface IsLead {
  id: string;
  name: string;                      // 顧客名
  phase: IsLeadPhase;                // フェーズ
  country?: string;                  // 国
  industry?: string;                 // 業態
  leadSource?: LeadSource;           // リードソース
  instagramAccount?: string;         // Instagramアカウント
  customerNeeds?: string;            // 顧客ニーズ
  quantity?: number;                 // 希望数量 (kg)
  priceRangeMin?: number;            // 希望価格下限 (円/kg)
  priceRangeMax?: number;            // 希望価格上限 (円/kg)
  expectedRevenue?: number;          // 見込み売上金額
  firstApproachDate?: string;        // 初回アプローチ日
  firstApproachMessage?: string;     // 初回アプローチメッセージ
  lastContactDate?: string;          // 最終接触日
  lostReason?: string;               // 失注理由
  memo?: string;                     // メモ
  createdAt?: string;                // 作成日時
  updatedAt?: string;                // 更新日時
}

/**
 * IS Lead作成用入力型
 */
export interface CreateIsLeadInput {
  name: string;                      // 必須: 顧客名
  phase?: IsLeadPhase;               // デフォルト: VALID_REPLY
  country?: string;
  industry?: string;
  leadSource?: LeadSource;
  instagramAccount?: string;
  customerNeeds?: string;
  quantity?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  expectedRevenue?: number;
  firstApproachDate?: string;
  firstApproachMessage?: string;
  lastContactDate?: string;
  lostReason?: string;
  memo?: string;
}

/**
 * IS Lead更新用入力型
 */
export interface UpdateIsLeadInput {
  id: string;                        // 必須: 更新対象ID
  name?: string;
  phase?: IsLeadPhase;
  country?: string;
  industry?: string;
  leadSource?: LeadSource;
  instagramAccount?: string;
  customerNeeds?: string;
  quantity?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  expectedRevenue?: number;
  firstApproachDate?: string;
  firstApproachMessage?: string;
  lastContactDate?: string;
  lostReason?: string;
  memo?: string;
}

/**
 * IS Lead検索用入力型
 */
export interface SearchIsLeadsInput {
  query?: string;                    // 名前検索
  phase?: IsLeadPhase;               // フェーズフィルタ
  leadSource?: LeadSource;           // ソースフィルタ
  country?: string;                  // 国フィルタ
  limit?: number;                    // 取得件数 (デフォルト: 20)
  offset?: number;                   // オフセット
}

/**
 * フェーズ別一覧の結果型
 */
export interface IsLeadsByPhase {
  VALID_REPLY: IsLead[];
  LOST: IsLead[];
  ON_HOLD: IsLead[];
  CONVERTED: IsLead[];
  totalCount: number;
}

/**
 * IS Lead統計情報
 */
export interface IsLeadStats {
  totalLeads: number;
  byPhase: {
    VALID_REPLY: number;
    LOST: number;
    ON_HOLD: number;
    CONVERTED: number;
  };
  bySource: Record<string, number>;
  byCountry: Record<string, number>;
  lostReasons: Record<string, number>;
  period?: {
    startDate: string;
    endDate: string;
  };
}
