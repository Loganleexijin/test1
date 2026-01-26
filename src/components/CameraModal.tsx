import { useState, useEffect } from 'react';
import { X, Camera, Image, Coffee, UtensilsCrossed, Moon, Cookie, ChevronRight, Crown, ScanLine } from 'lucide-react';
import { useFastingStore } from '@/store/fastingStore';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type ModalStep = 'select_meal' | 'select_method' | 'preview';

const MEAL_TYPES = [
  { id: 'breakfast' as MealType, label: '早餐', icon: Coffee, color: 'bg-amber-100 text-amber-600', borderColor: 'border-amber-300' },
  { id: 'lunch' as MealType, label: '午餐', icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-600', borderColor: 'border-orange-300' },
  { id: 'dinner' as MealType, label: '晚餐', icon: Moon, color: 'bg-indigo-100 text-indigo-600', borderColor: 'border-indigo-300' },
  { id: 'snack' as MealType, label: '加餐', icon: Cookie, color: 'bg-pink-100 text-pink-600', borderColor: 'border-pink-300' },
];

export default function CameraModal({ isOpen, onClose }: CameraModalProps) {
  const { addMealRecord, analyzeMeal, userProfile } = useFastingStore();
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [error, setError] = useState('');
  
  // Flow state
  const [step, setStep] = useState<ModalStep>('select_meal');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('select_meal');
      setPreviewImage(null);
      setError('');
      return;
    }

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) setSelectedMealType('breakfast');
    else if (hour >= 11 && hour < 17) setSelectedMealType('lunch');
    else if (hour >= 17 && hour < 22) setSelectedMealType('dinner');
    else setSelectedMealType('snack');
    
    setStep('select_meal');
  }, [isOpen]);

  const compressImage = (
    base64Str: string,
    maxWidth = 768,
    maxQuality = 0.75,
    targetSizeMB = 0.6
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.src = base64Str;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          let quality = maxQuality;
          let result = canvas.toDataURL('image/jpeg', quality);

          const compressRecursively = (currentQuality: number) => {
            const sizeInBytes = Math.round((result.length * 3) / 4);
            const sizeInMB = sizeInBytes / (1024 * 1024);

            if (sizeInMB <= targetSizeMB || currentQuality < 0.4) {
              resolve(result);
            } else {
              quality = currentQuality - 0.1;
              result = canvas.toDataURL('image/jpeg', quality);
              compressRecursively(quality);
            }
          };

          compressRecursively(quality);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = (err) => reject(err);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError('');
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setError('请选择有效的图片文件');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        try {
          const compressedBase64 = await compressImage(rawBase64);
          setPreviewImage(compressedBase64);
          setStep('preview');
        } catch (compressErr) {
          console.error('Image compression failed:', compressErr);
          setError('图片处理失败，请重试');
        }
      };
      reader.onerror = () => {
        setError('图片读取失败');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File selection error:', err);
      setError('选择图片时发生错误');
    }
  };

  const handleConfirm = async () => {
    if (!previewImage) return;

    if (!userProfile.isPro && userProfile.remainingFreeAnalyses <= 0) {
      alert('免费试用次数已用完，请升级解锁无限次分析');
      return;
    }

    const recordId = crypto.randomUUID();

    // 1. Add record immediately with 'analyzing' status
    addMealRecord({
      id: recordId,
      timestamp: Date.now(),
      type: selectedMealType,
      imageUrl: previewImage,
      foodName: 'AI正在分析...',
      calories: 0,
      status: 'analyzing',
    });

    void analyzeMeal(recordId, previewImage);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-2 flex items-center justify-between z-20 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'select_meal' && '选择餐次'}
            {step === 'select_method' && '记录饮食'}
            {step === 'preview' && '确认照片'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* STEP 1: Select Meal */}
          {step === 'select_meal' && (
            <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-300">
              <p className="text-gray-500 mb-6">请选择您要记录的餐次：</p>
              <div className="grid grid-cols-1 gap-4">
                {MEAL_TYPES.map((meal) => {
                  const Icon = meal.icon;
                  const isSelected = selectedMealType === meal.id;
                  return (
                    <button
                      key={meal.id}
                      onClick={() => {
                        setSelectedMealType(meal.id);
                        setStep('select_method');
                      }}
                      className={`
                        flex items-center p-4 rounded-2xl border-2 transition-all duration-200 w-full text-left group
                        ${isSelected
                          ? `${meal.color} ${meal.borderColor} shadow-md`
                          : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                        }
                      `}
                    >
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center mr-4
                        ${isSelected ? 'bg-white/50' : 'bg-gray-100 group-hover:bg-white'}
                        transition-colors
                      `}>
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-current' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <span className={`text-lg font-bold block ${isSelected ? 'text-current' : 'text-gray-800'}`}>
                          {meal.label}
                        </span>
                        <span className={`text-xs ${isSelected ? 'opacity-80' : 'text-gray-400'}`}>
                          记录{meal.label}摄入
                        </span>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${isSelected ? 'opacity-100' : 'text-gray-300'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Select Method */}
          {step === 'select_method' && (
             <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-2 mb-6 bg-gray-50 p-3 rounded-xl">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${MEAL_TYPES.find(m => m.id === selectedMealType)?.color.split(' ')[0]}`}>
                     {(() => {
                        const Icon = MEAL_TYPES.find(m => m.id === selectedMealType)?.icon || Coffee;
                        return <Icon className="w-4 h-4 text-gray-700" />;
                     })()}
                  </div>
                  <span className="font-medium text-gray-700">已选择：{MEAL_TYPES.find(m => m.id === selectedMealType)?.label}</span>
                  <button onClick={() => setStep('select_meal')} className="ml-auto text-xs text-blue-500 font-medium">更换</button>
                </div>

                {/* Free Trial / VIP Status */}
                {!userProfile.isPro && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-purple-600 font-semibold mb-1">AI 分析体验次数</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {userProfile.remainingFreeAnalyses} <span className="text-sm font-normal text-gray-500">/ 7</span>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-md hover:scale-105 transition-transform">
                      <Crown className="w-3 h-3 text-yellow-400" />
                      升级无限次
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 flex-1">
                  <label className="cursor-pointer group relative overflow-hidden h-40">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="flex flex-row items-center justify-between p-8 rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 h-full">
                      <div className="flex flex-col">
                        <span className="font-bold text-2xl mb-1">AI 拍照识别</span>
                        <span className="text-sm opacity-90">精准识别食物热量</span>
                      </div>
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Camera className="w-8 h-8" />
                      </div>
                    </div>
                  </label>

                  <label className="cursor-pointer group relative overflow-hidden h-32">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="flex flex-row items-center justify-between p-8 rounded-3xl bg-white border-2 border-gray-100 hover:border-purple-200 hover:bg-purple-50 text-gray-700 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 h-full">
                       <div className="flex flex-col">
                        <span className="font-bold text-xl mb-1">相册上传</span>
                        <span className="text-sm text-gray-400">选择已有图片</span>
                      </div>
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <Image className="w-6 h-6 text-purple-500" />
                      </div>
                    </div>
                  </label>
                </div>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center animate-in fade-in">
                    {error}
                  </div>
                )}
             </div>
          )}

          {/* STEP 3: Preview */}
          {step === 'preview' && previewImage && (
            <div className="flex-1 flex flex-col p-6 animate-in zoom-in-95 duration-300">
              <div className="relative rounded-3xl overflow-hidden shadow-lg aspect-square mb-6 bg-black group">
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                
                {/* Scan Animation Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent animate-scan pointer-events-none opacity-50" />
                
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md rounded-xl p-3 text-white text-center">
                  <p className="text-sm font-medium">确认照片清晰度</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <button
                  onClick={() => {
                    setPreviewImage(null);
                    setStep('select_method');
                  }}
                  className="py-4 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                >
                  重拍
                </button>
                <button
                  onClick={handleConfirm}
                  className="py-4 rounded-2xl bg-black text-white font-bold hover:bg-gray-900 transition-colors shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
                >
                  <ScanLine className="w-5 h-5" />
                  开始分析
                </button>
              </div>
            </div>
          )}


        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
