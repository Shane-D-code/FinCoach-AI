import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DailySpend from '../components/DailySpend';

export default function DailySpendPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  const handleSpendAdded = () => {
    // Navigate to dashboard after adding spend
    navigate('/dashboard');
  };

  const handleDoneForToday = () => {
    // Navigate to dashboard when done for today
    navigate('/dashboard');
  };

  // If modal is closed, navigate to dashboard
  useEffect(() => {
    if (!showModal) {
      navigate('/dashboard');
    }
  }, [showModal, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full">
        <DailySpend onSpendAdded={handleSpendAdded} forceShow={true} />
      </div>
    </div>
  );
}
