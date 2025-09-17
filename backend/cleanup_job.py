import os
import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime, timedelta
import logging
import schedule
import time

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('cleanup_job.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Firebase初期化
if not firebase_admin._apps:
    cred = credentials.Certificate({
        "project_id": os.environ.get('FIREBASE_ADMIN_PROJECT_ID'),
        "private_key": os.environ.get('FIREBASE_ADMIN_PRIVATE_KEY', '').replace('\\n', '\n'),
        "client_email": os.environ.get('FIREBASE_ADMIN_CLIENT_EMAIL'),
    })
    firebase_admin.initialize_app(cred, {
        'storageBucket': os.environ.get('FIREBASE_STORAGE_BUCKET', '')
    })

db = firestore.client()
bucket = storage.bucket()

class DataCleanupService:
    """個人データの自動削除サービス"""
    
    def __init__(self):
        self.retention_days = {
            'diagnosis_images': 30,  # 診断画像は30日
            'diagnosis_results': 365,  # 診断結果は1年
            'user_data': 730,  # ユーザーデータは2年（非アクティブの場合）
            'audit_logs': 1095,  # 監査ログは3年
        }
    
    def cleanup_old_diagnosis_images(self):
        """古い診断画像を削除"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=self.retention_days['diagnosis_images'])
            
            # Firestoreから古い診断レコードを取得
            diagnoses_ref = db.collection('diagnoses')
            old_diagnoses = diagnoses_ref.where('createdAt', '<', cutoff_date).stream()
            
            deleted_count = 0
            for diagnosis in old_diagnoses:
                diagnosis_data = diagnosis.to_dict()
                
                # 画像URLがある場合、Storageから削除
                if 'imageUrl' in diagnosis_data:
                    try:
                        # URLからファイルパスを抽出
                        image_path = self._extract_storage_path(diagnosis_data['imageUrl'])
                        if image_path:
                            blob = bucket.blob(image_path)
                            blob.delete()
                            logger.info(f"Deleted image: {image_path}")
                    except Exception as e:
                        logger.error(f"Failed to delete image: {e}")
                
                # Firestoreレコードから画像URL削除（診断結果は保持）
                diagnosis.reference.update({
                    'imageUrl': firestore.DELETE_FIELD,
                    'imageDeletedAt': firestore.SERVER_TIMESTAMP
                })
                
                deleted_count += 1
            
            logger.info(f"Cleaned up {deleted_count} old diagnosis images")
            
            # 監査ログに記録
            self._record_audit_log('diagnosis_images_cleanup', {
                'deleted_count': deleted_count,
                'cutoff_date': cutoff_date.isoformat()
            })
            
        except Exception as e:
            logger.error(f"Diagnosis image cleanup failed: {e}")
    
    def process_deletion_requests(self):
        """削除リクエストの処理"""
        try:
            # 期限が来た削除リクエストを取得
            deletion_requests = db.collection('deletion_requests')\
                .where('status', '==', 'pending')\
                .where('scheduledDeletionDate', '<=', datetime.utcnow())\
                .stream()
            
            for request in deletion_requests:
                request_data = request.to_dict()
                user_id = request_data['userId']
                
                try:
                    # ユーザーデータを完全削除
                    self._delete_user_data(user_id)
                    
                    # 削除リクエストのステータス更新
                    request.reference.update({
                        'status': 'completed',
                        'completedAt': firestore.SERVER_TIMESTAMP
                    })
                    
                    logger.info(f"Completed deletion for user: {user_id}")
                    
                except Exception as e:
                    logger.error(f"Failed to delete user data for {user_id}: {e}")
                    request.reference.update({
                        'status': 'failed',
                        'error': str(e),
                        'failedAt': firestore.SERVER_TIMESTAMP
                    })
        
        except Exception as e:
            logger.error(f"Deletion request processing failed: {e}")
    
    def _delete_user_data(self, user_id):
        """ユーザーの全データを削除"""
        collections_to_delete = [
            'users',
            'diagnoses',
            'complete_diagnoses',
            'bookings',
            'reviews',
            'privacy_consents'
        ]
        
        for collection_name in collections_to_delete:
            # コレクション内のユーザーデータを取得
            if collection_name == 'users':
                docs = [db.collection(collection_name).document(user_id)]
            else:
                docs = db.collection(collection_name).where('userId', '==', user_id).stream()
            
            for doc in docs:
                # ドキュメントに関連する画像を削除
                if hasattr(doc, 'to_dict'):
                    doc_data = doc.to_dict()
                    if doc_data and 'imageUrl' in doc_data:
                        image_path = self._extract_storage_path(doc_data['imageUrl'])
                        if image_path:
                            try:
                                blob = bucket.blob(image_path)
                                blob.delete()
                            except Exception:
                                pass
                
                # ドキュメント削除
                if hasattr(doc, 'reference'):
                    doc.reference.delete()
                else:
                    doc.delete()
        
        # 監査ログに記録（ユーザーIDはハッシュ化）
        import hashlib
        hashed_user_id = hashlib.sha256(user_id.encode()).hexdigest()
        self._record_audit_log('user_data_deleted', {
            'hashed_user_id': hashed_user_id,
            'collections_deleted': collections_to_delete
        })
    
    def cleanup_inactive_users(self):
        """非アクティブユーザーのクリーンアップ"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=self.retention_days['user_data'])
            
            # 最終ログインが2年以上前のユーザーを取得
            inactive_users = db.collection('users')\
                .where('lastLoginAt', '<', cutoff_date)\
                .where('accountStatus', '==', 'active')\
                .stream()
            
            for user in inactive_users:
                user_data = user.to_dict()
                user_id = user.id
                
                # 削除リクエストを作成
                db.collection('deletion_requests').add({
                    'userId': user_id,
                    'reason': 'inactive_account',
                    'requestedAt': firestore.SERVER_TIMESTAMP,
                    'scheduledDeletionDate': datetime.utcnow() + timedelta(days=30),
                    'status': 'pending'
                })
                
                # ユーザーに通知を送信（実装は省略）
                logger.info(f"Scheduled deletion for inactive user: {user_id}")
        
        except Exception as e:
            logger.error(f"Inactive user cleanup failed: {e}")
    
    def cleanup_old_audit_logs(self):
        """古い監査ログの削除"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=self.retention_days['audit_logs'])
            
            old_logs = db.collection('audit_logs')\
                .where('timestamp', '<', cutoff_date)\
                .stream()
            
            deleted_count = 0
            batch = db.batch()
            
            for log in old_logs:
                batch.delete(log.reference)
                deleted_count += 1
                
                # バッチサイズ制限
                if deleted_count % 500 == 0:
                    batch.commit()
                    batch = db.batch()
            
            if deleted_count % 500 != 0:
                batch.commit()
            
            logger.info(f"Deleted {deleted_count} old audit logs")
        
        except Exception as e:
            logger.error(f"Audit log cleanup failed: {e}")
    
    def _extract_storage_path(self, url):
        """Storage URLからファイルパスを抽出"""
        if not url:
            return None
        
        # Firebase Storage URLのパターン
        patterns = [
            'firebasestorage.googleapis.com/v0/b/[^/]+/o/',
            'storage.googleapis.com/[^/]+/'
        ]
        
        for pattern in patterns:
            import re
            match = re.search(pattern + '(.+?)(?:\\?|$)', url)
            if match:
                import urllib.parse
                return urllib.parse.unquote(match.group(1))
        
        return None
    
    def _record_audit_log(self, action, details):
        """監査ログの記録"""
        try:
            db.collection('audit_logs').add({
                'action': action,
                'details': details,
                'timestamp': firestore.SERVER_TIMESTAMP,
                'service': 'cleanup_job'
            })
        except Exception as e:
            logger.error(f"Failed to record audit log: {e}")

def run_cleanup_job():
    """クリーンアップジョブの実行"""
    logger.info("Starting cleanup job...")
    
    service = DataCleanupService()
    
    # 各クリーンアップタスクを実行
    service.cleanup_old_diagnosis_images()
    service.process_deletion_requests()
    service.cleanup_inactive_users()
    service.cleanup_old_audit_logs()
    
    logger.info("Cleanup job completed")

def main():
    """メイン処理"""
    # 毎日午前2時に実行
    schedule.every().day.at("02:00").do(run_cleanup_job)
    
    # 初回実行
    run_cleanup_job()
    
    # スケジュールループ
    while True:
        schedule.run_pending()
        time.sleep(60)  # 1分ごとにチェック

if __name__ == "__main__":
    main()