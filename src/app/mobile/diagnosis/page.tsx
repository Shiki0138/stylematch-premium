'use client';

import { useRouter } from 'next/navigation';
import { FaceDiagnosis } from '@/components/mobile/FaceDiagnosis';
import { useDiagnosisStore } from '@/lib/stores/diagnosisStore';

export default function MobileDiagnosisPage() {
  const router = useRouter();
  const setDiagnosisResult = useDiagnosisStore((state) => state.setDiagnosisResult);

  const handleBack = () => {
    router.push('/mobile');
  };

  const handleComplete = (result: any) => {
    setDiagnosisResult(result);
  };

  const handleViewStylists = () => {
    router.push('/mobile/stylists');
  };

  return (
    <FaceDiagnosis
      onBack={handleBack}
      onComplete={handleComplete}
      onViewStylists={handleViewStylists}
    />
  );
}