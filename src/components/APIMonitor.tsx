/**
 * API使用量モニタリングコンポーネント
 * 管理者向けの使用量確認と緊急停止機能
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import APILimiter from '../services/apiLimiter';

interface APIMonitorProps {
  isVisible: boolean;
  onClose: () => void;
}

export const APIMonitor: React.FC<APIMonitorProps> = ({ isVisible, onClose }) => {
  const [stats, setStats] = useState<any>(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  const loadStats = async () => {
    try {
      const apiLimiter = APILimiter.getInstance();
      const currentStats = await apiLimiter.getUsageStats();
      setStats(currentStats);
    } catch (error) {
      console.error('Failed to load API limiter stats', error);
      Alert.alert('読み込みエラー', 'API使用量の取得に失敗しました');
    }
  };

  useEffect(() => {
    if (isVisible) {
      loadStats();
    }
  }, [isVisible]);

  const handleEmergencyStop = () => {
    Alert.alert(
      '🚨 緊急停止',
      'APIの使用を緊急停止しますか？この操作により、すべてのAI機能が無効化されます。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '停止する',
          style: 'destructive',
          onPress: () => {
            const apiLimiter = APILimiter.getInstance();
            apiLimiter.emergencyStop();
            setIsEmergencyMode(true);
            loadStats();
            Alert.alert('✅ 緊急停止完了', 'API使用が停止されました');
          },
        },
      ]
    );
  };

  const handleResume = () => {
    Alert.alert(
      '🔄 運用再開',
      'API使用を再開しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '再開する',
          onPress: () => {
            const apiLimiter = APILimiter.getInstance();
            apiLimiter.resumeOperation();
            setIsEmergencyMode(false);
            loadStats();
            Alert.alert('✅ 運用再開', 'API使用が再開されました');
          },
        },
      ]
    );
  };

  const getProgressPercentage = (used: number, limit: number): number => {
    return Math.min((used / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return '#ff4757';
    if (percentage >= 70) return '#ffa502';
    return '#2ed573';
  };

  if (!isVisible || !stats) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          <Text style={styles.title}>🔍 API使用量モニター</Text>
          
          {isEmergencyMode && (
            <View style={styles.emergencyBanner}>
              <Text style={styles.emergencyText}>🚨 緊急停止中</Text>
            </View>
          )}

          {/* 日次使用量 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 本日の使用量</Text>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>トークン使用量</Text>
              <Text style={styles.statValue}>
                {stats.dailyTokens.toLocaleString()} / {stats.limits.dailyTokenLimit.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: getProgressColor(getProgressPercentage(stats.dailyTokens, stats.limits.dailyTokenLimit)) }]}>
              <View style={[styles.progress, { width: `${getProgressPercentage(stats.dailyTokens, stats.limits.dailyTokenLimit)}%` }]} />
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>リクエスト回数</Text>
              <Text style={styles.statValue}>
                {stats.dailyRequests} / {stats.limits.dailyRequestLimit}
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: getProgressColor(getProgressPercentage(stats.dailyRequests, stats.limits.dailyRequestLimit)) }]}>
              <View style={[styles.progress, { width: `${getProgressPercentage(stats.dailyRequests, stats.limits.dailyRequestLimit)}%` }]} />
            </View>
          </View>

          {/* 月次使用量 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 今月の使用量</Text>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>トークン使用量</Text>
              <Text style={styles.statValue}>
                {stats.monthlyTokens.toLocaleString()} / {stats.limits.monthlyTokenLimit.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: getProgressColor(getProgressPercentage(stats.monthlyTokens, stats.limits.monthlyTokenLimit)) }]}>
              <View style={[styles.progress, { width: `${getProgressPercentage(stats.monthlyTokens, stats.limits.monthlyTokenLimit)}%` }]} />
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>リクエスト回数</Text>
              <Text style={styles.statValue}>
                {stats.monthlyRequests} / {stats.limits.monthlyRequestLimit}
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: getProgressColor(getProgressPercentage(stats.monthlyRequests, stats.limits.monthlyRequestLimit)) }]}>
              <View style={[styles.progress, { width: `${getProgressPercentage(stats.monthlyRequests, stats.limits.monthlyRequestLimit)}%` }]} />
            </View>
          </View>

          {/* 制限設定 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ 制限設定</Text>
            <Text style={styles.limitText}>最大画像サイズ: {stats.limits.maxImageSize}KB</Text>
            <Text style={styles.limitText}>1回あたり最大トークン: {stats.limits.maxTokensPerRequest}</Text>
          </View>

          {/* 緊急制御 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 緊急制御</Text>
            {isEmergencyMode ? (
              <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
                <Text style={styles.buttonText}>🔄 運用再開</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyStop}>
                <Text style={styles.buttonText}>🚨 緊急停止</Text>
              </TouchableOpacity>
            )}
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.refreshButton} onPress={loadStats}>
            <Text style={styles.buttonText}>🔄 更新</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>✕ 閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 1000,
  },
  container: {
    flex: 1,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  emergencyBanner: {
    backgroundColor: '#ff4757',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  emergencyText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  section: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginBottom: 15,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  limitText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#ecf0f1',
  },
  emergencyButton: {
    backgroundColor: '#ff4757',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resumeButton: {
    backgroundColor: '#2ed573',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButton: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default APIMonitor;
