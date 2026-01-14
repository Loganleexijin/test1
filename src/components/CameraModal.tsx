import { useState, useEffect, useRef } from 'react';
import { X, Camera, Image, Sparkles, Activity, Coffee, UtensilsCrossed, Moon, Cookie, Clock, XCircle } from 'lucide-react';
import { useFastingStore } from '@/store/fastingStore';
import type { FoodAnalysisResponse, FoodAnalysisResult } from '@/types';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const MEAL_TYPES = [
  { id: 'breakfast' as MealType, label: '早餐', icon: Coffee, color: 'bg-amber-100 text-amber-600', borderColor: 'border-amber-300' },
  { id: 'lunch' as MealType, label: '午餐', icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-600', borderColor: 'border-orange-300' },
  { id: 'dinner' as MealType, label: '晚餐', icon: Moon, color: 'bg-indigo-100 text-indigo-600', borderColor: 'border-indigo-300' },
  { id: 'snack' as MealType, label: '加餐', icon: Cookie, color: 'bg-pink-100 text-pink-600', borderColor: 'border-pink-300' },
];

export default function CameraModal({ isOpen, onClose }: CameraModalProps) {
  const { currentSession, saveAIResult, addMealRecord } = useFastingStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResponse | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isClosingRef = useRef(false);
  const okResult = result && !('error' in result) ? result : null;

  useEffect(() => {
    if (!isOpen) {
      isClosingRef.current = false;
      return;
    }

    // Auto-select meal type based on time
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) setSelectedMealType('breakfast');
    else if (hour >= 11 && hour < 17) setSelectedMealType('lunch');
    else if (hour >= 17 && hour < 22) setSelectedMealType('dinner');
    else setSelectedMealType('snack');

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isOpen]);

  const compressImage = (base64Str: string, maxWidth = 1024, maxQuality = 0.85): Promise<string> => {
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

            if (sizeInMB <= 2 || currentQuality < 0.5) {
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

      // Basic validation
      if (!file.type.startsWith('image/')) {
        setError('请选择有效的图片文件');
        return;
      }

      // Read file
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        try {
          // Compress image before setting state or uploading
          const compressedBase64 = await compressImage(rawBase64);
          setSelectedImage(compressedBase64);
          handleAnalyze(compressedBase64);
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

  const handleAnalyze = async (imageData: string) => {
    setAnalyzing(true);
    setError('');
    setProgress(0);
    setEstimatedTime(5);

    abortControllerRef.current = new AbortController();

    try {
      const currentState =
        currentSession?.fasting_status === 'fasting'
          ? '断食中'
          : currentSession?.fasting_status === 'eating'
            ? '进食窗口'
            : '准备开始断食';

      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
        setEstimatedTime(prev => Math.max(prev - 1, 0));
      }, 500);

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          sessionId: currentSession?.id || 'manual',
          currentState,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setProgress(100);

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as FoodAnalysisResponse | null;
        if (data && 'error' in data && data.error) {
          throw new Error(data.message);
        }
        throw new Error(`分析失败 (${response.status})，请重试`);
      }

      const data: FoodAnalysisResponse = await response.json();
      setResult(data);

      if (data && 'error' in data && data.error) {
        setError(data.message);
        setSelectedImage(null);
        setResult(null);
        return;
      }

      if (currentSession) {
        saveAIResult(currentSession.id, data as FoodAnalysisResult);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('');
        setSelectedImage(null);
      } else {
        console.error('Analysis error:', err);
        setError(err instanceof Error ? err.message : '未知错误');
        setSelectedImage(null);
      }
    } finally {
      if (!isClosingRef.current) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setAnalyzing(false);
        setProgress(0);
        setEstimatedTime(0);
      }
    }
  };

  const handleClose = () => {
    isClosingRef.current = true;
    
    if (analyzing && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    setAnalyzing(false);
    setProgress(0);
    setEstimatedTime(0);
    setError('');
    
    handleReset();
    onClose();
  };

  const handleSaveAndClose = () => {
    if (!okResult || !selectedImage) return;
      addMealRecord({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: selectedMealType,
        imageUrl: selectedImage,
        foodName: okResult.foodName,
        calories: okResult.calories,
        tags: okResult.tags,
        aiAnalysis: okResult,
      });
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-black/10 rounded-full hover:bg-black/20 transition-colors z-20 cursor-pointer"
          type="button"
          aria-label="关闭"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {!selectedImage ? (
          // Camera/Upload View
          <div className="flex-1 flex flex-col p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center mt-4">拍照记录饮食</h2>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-3 text-center">选择餐次</p>
              <div className="grid grid-cols-4 gap-3">
                {MEAL_TYPES.map((meal) => {
                  const Icon = meal.icon;
                  const isSelected = selectedMealType === meal.id;
                  return (
                    <button
                      key={meal.id}
                      onClick={() => setSelectedMealType(meal.id)}
                      className={`
                        relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-200
                        ${isSelected 
                          ? `${meal.color} ${meal.borderColor} border-2 scale-105 shadow-md` 
                          : 'bg-gray-50 border-transparent hover:bg-gray-100'
                        }
                      `}
                    >
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center mb-2
                        ${isSelected ? 'scale-110' : 'scale-100'}
                        transition-transform duration-200
                      `}>
                        <Icon className={`w-5 h-5 ${isSelected ? '' : 'text-gray-400'}`} />
                      </div>
                      <span className={`text-xs font-medium ${isSelected ? 'font-bold' : 'text-gray-500'}`}>
                        {meal.label}
                      </span>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <label className="w-full cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-orange-50 border-2 border-dashed border-orange-200 group-hover:border-orange-400 transition-all">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-orange-500" />
                  </div>
                  <span className="font-semibold text-orange-900">拍摄食物</span>
                  <span className="text-sm text-orange-600/70 mt-1">AI 自动识别热量与营养</span>
                </div>
              </label>

              <div className="relative w-full text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <span className="relative bg-white px-4 text-sm text-gray-400">或</span>
              </div>

              <label className="w-full cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-gray-100 transition-all">
                  <Image className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700">从相册选择</span>
                </div>
              </label>
              
              {error && (
                <div className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg text-center animate-in fade-in slide-in-from-bottom-2">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : analyzing ? (
          // Loading State
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-blue-100 rounded-full">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-blue-100"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-blue-600 transition-all duration-300"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">{progress}%</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI 正在分析餐盘...</h3>
            <p className="text-gray-500 text-sm mb-2">识别热量与升糖风险</p>
            {estimatedTime > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <Clock className="w-4 h-4" />
                <span>预计还需 {estimatedTime} 秒</span>
              </div>
            )}
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>取消分析</span>
            </button>
          </div>
        ) : okResult ? (
          // Result State
          <div className="flex-1 flex flex-col p-6 bg-white overflow-y-auto">
            {/* Header Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">AI 识别成功</span>
                <span className="text-gray-400 text-xs">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Food Title & Calories */}
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight max-w-[70%]">
                {okResult.foodName}
              </h2>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-orange-500">{okResult.calories}</div>
                <div className="text-xs text-gray-400 font-medium">kcal</div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {okResult.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                  {tag}
                </span>
              ))}
            </div>

            {/* Advice Cards */}
            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-blue-800">AI 营养建议</span>
                </div>
                <p className="text-sm text-blue-900/80 leading-relaxed">
                  {okResult.advice}
                </p>
              </div>

              <div className="bg-orange-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-bold text-orange-800">行动指南</span>
                </div>
                <p className="text-sm text-orange-900/80 leading-relaxed">
                  {okResult.nextStep}
                </p>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="mt-auto">
              <button
                onClick={handleSaveAndClose}
                className="w-full py-4 bg-[#1a1b2e] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-gray-900 active:scale-[0.98] transition-all"
              >
                记录并完成
              </button>
            </div>
          </div>
        ) : (
          // Error State within modal (fallback if not caught earlier)
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">分析失败</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-xs">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                重新拍照
              </button>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
