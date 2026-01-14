import { useState } from 'react';
import { Edit, Calendar } from 'lucide-react';
import { useFastingStore } from '@/store/fastingStore';
import EditTimeModal from './EditTimeModal';
import BackfillModal from './BackfillModal';

export default function SecondaryActions() {
  const { currentSession } = useFastingStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBackfillModal, setShowBackfillModal] = useState(false);

  const canEdit = () => {
    if (!currentSession) return false;
    const elapsedMinutes = Math.floor((Date.now() - currentSession.start_at) / 60000);
    return elapsedMinutes <= 30;
  };

  return (
    <>
      <div className="flex justify-center gap-4 mt-8 px-4">
        <button
          onClick={() => setShowEditModal(true)}
          disabled={!canEdit()}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl backdrop-blur-md border transition-all duration-300 ${
            canEdit()
              ? 'bg-white/10 border-white/20 hover:bg-white/20 text-gray-700 dark:text-gray-200'
              : 'bg-gray-100/50 border-gray-200/50 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Edit className="w-4 h-4" />
          <span className="text-sm font-medium">修改开始时间</span>
        </button>

        <button
          onClick={() => setShowBackfillModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl backdrop-blur-md border bg-white/10 border-white/20 hover:bg-white/20 text-gray-700 dark:text-gray-200 transition-all duration-300"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">补录断食</span>
        </button>
      </div>

      <EditTimeModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />

      <BackfillModal
        isOpen={showBackfillModal}
        onClose={() => setShowBackfillModal(false)}
      />
    </>
  );
}
