import { StyleSheet, Text, View } from 'react-native';

/**
 * Expo 用カメラ機能の実装前に表示するプレースホルダ。
 * - `expo-camera` を導入してプレビュー / 撮影を提供する
 * - `expo-media-library` との連携で保存・共有
 * - スタイル合成用の画像解析APIへ送る前処理を組み込む
 */
export const CameraWorkInProgress = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.badge}>WIP</Text>
      <Text style={styles.title}>カメラ機能はこれから実装予定です。</Text>
      <Text style={styles.item}>• expo-camera でプレビュー & 撮影</Text>
      <Text style={styles.item}>• 画像圧縮 & Base64 変換ユーティリティ</Text>
      <Text style={styles.item}>• 合成用AIへのアップロード連携</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#6C63FF',
    padding: 20,
    backgroundColor: '#F5F3FF',
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#6C63FF',
    color: '#fff',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D3A66',
  },
  item: {
    fontSize: 13,
    color: '#4F4B80',
  },
});
