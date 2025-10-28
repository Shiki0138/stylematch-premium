/**
 * Gemini API使用量制限とガードレール
 * 多量のトークン使用を防ぐためのセーフティシステム
 */

export interface UsageStats {
  dailyTokens: number;
  dailyRequests: number;
  monthlyTokens: number;
  monthlyRequests: number;
  lastResetDate: string;
  lastResetMonth: string;
}

export interface UsageLimits {
  dailyTokenLimit: number;
  dailyRequestLimit: number;
  monthlyTokenLimit: number;
  monthlyRequestLimit: number;
  maxTokensPerRequest: number;
  maxImageSize: number; // KB
}

// 厳格な制限設定
export const DEFAULT_LIMITS: UsageLimits = {
  dailyTokenLimit: 50000,      // 1日5万トークン
  dailyRequestLimit: 20,       // 1日20リクエスト
  monthlyTokenLimit: 1000000,  // 月100万トークン
  monthlyRequestLimit: 500,    // 月500リクエスト
  maxTokensPerRequest: 4096,   // 1リクエスト最大4096トークン（8192から削減）
  maxImageSize: 1024,          // 最大1MB
};

class APILimiter {
  private static instance: APILimiter;
  private limits: UsageLimits;
  private usage: UsageStats;
  private storageKey = 'gemini_api_usage';
  private isEmergencyStop = false;

  private constructor() {
    this.limits = DEFAULT_LIMITS;
    this.usage = this.loadUsageStats();
    this.checkResetPeriods();
  }

  public static getInstance(): APILimiter {
    if (!APILimiter.instance) {
      APILimiter.instance = new APILimiter();
    }
    return APILimiter.instance;
  }

  // 緊急停止機能
  public emergencyStop(): void {
    this.isEmergencyStop = true;
    console.warn('🚨 API EMERGENCY STOP ACTIVATED');
  }

  public resumeOperation(): void {
    this.isEmergencyStop = false;
    console.log('✅ API operations resumed');
  }

  // 使用前チェック
  public async checkBeforeRequest(estimatedTokens: number, imageSize?: number): Promise<void> {
    if (this.isEmergencyStop) {
      throw new Error('🚨 API緊急停止中: 管理者にお問い合わせください');
    }

    // 画像サイズチェック
    if (imageSize && imageSize > this.limits.maxImageSize * 1024) {
      throw new Error(`画像サイズが大きすぎます（最大${this.limits.maxImageSize}KB）`);
    }

    // 1リクエストあたりのトークン制限
    if (estimatedTokens > this.limits.maxTokensPerRequest) {
      throw new Error(`1回のリクエストで使用可能なトークン数を超過（最大${this.limits.maxTokensPerRequest}）`);
    }

    // 日次制限チェック
    if (this.usage.dailyRequests >= this.limits.dailyRequestLimit) {
      throw new Error('本日のAPI使用回数上限に達しました。明日再度お試しください。');
    }

    if (this.usage.dailyTokens + estimatedTokens > this.limits.dailyTokenLimit) {
      throw new Error('本日のAPI使用量上限に達しました。明日再度お試しください。');
    }

    // 月次制限チェック
    if (this.usage.monthlyRequests >= this.limits.monthlyRequestLimit) {
      throw new Error('今月のAPI使用回数上限に達しました。来月再度お試しください。');
    }

    if (this.usage.monthlyTokens + estimatedTokens > this.limits.monthlyTokenLimit) {
      throw new Error('今月のAPI使用量上限に達しました。来月再度お試しください。');
    }
  }

  // 使用量記録
  public recordUsage(actualTokens: number): void {
    this.usage.dailyTokens += actualTokens;
    this.usage.dailyRequests += 1;
    this.usage.monthlyTokens += actualTokens;
    this.usage.monthlyRequests += 1;
    
    this.saveUsageStats();
    
    console.log('📊 API使用量記録:', {
      今回使用: actualTokens,
      本日累計: `${this.usage.dailyTokens}/${this.limits.dailyTokenLimit}`,
      今月累計: `${this.usage.monthlyTokens}/${this.limits.monthlyTokenLimit}`,
      本日リクエスト: `${this.usage.dailyRequests}/${this.limits.dailyRequestLimit}`
    });

    // 使用量が80%を超えた場合の警告
    if (this.usage.dailyTokens > this.limits.dailyTokenLimit * 0.8) {
      console.warn('⚠️ 本日のAPI使用量が80%を超えました');
    }
  }

  // 使用量取得
  public getUsageStats(): UsageStats & { limits: UsageLimits } {
    return {
      ...this.usage,
      limits: this.limits
    };
  }

  // 制限設定更新
  public updateLimits(newLimits: Partial<UsageLimits>): void {
    this.limits = { ...this.limits, ...newLimits };
    console.log('📋 API制限設定更新:', this.limits);
  }

  private loadUsageStats(): UsageStats {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('使用量データの読み込みに失敗:', error);
    }

    // デフォルト値
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);
    
    return {
      dailyTokens: 0,
      dailyRequests: 0,
      monthlyTokens: 0,
      monthlyRequests: 0,
      lastResetDate: today,
      lastResetMonth: month
    };
  }

  private saveUsageStats(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.usage));
    } catch (error) {
      console.error('使用量データの保存に失敗:', error);
    }
  }

  private checkResetPeriods(): void {
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);

    // 日次リセット
    if (this.usage.lastResetDate !== today) {
      this.usage.dailyTokens = 0;
      this.usage.dailyRequests = 0;
      this.usage.lastResetDate = today;
      console.log('🔄 日次使用量をリセットしました');
    }

    // 月次リセット
    if (this.usage.lastResetMonth !== month) {
      this.usage.monthlyTokens = 0;
      this.usage.monthlyRequests = 0;
      this.usage.lastResetMonth = month;
      console.log('🔄 月次使用量をリセットしました');
    }

    this.saveUsageStats();
  }
}

export default APILimiter;