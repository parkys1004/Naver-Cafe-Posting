import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Calendar, Repeat } from 'lucide-react';

interface SchedulePickerProps {
  value: string; // ISO string for one-time, or JSON string for recurring
  onChange: (value: string) => void;
}

type ScheduleType = 'once' | 'daily' | 'weekly';

export const SchedulePicker: React.FC<SchedulePickerProps> = ({ value, onChange }) => {
  const [type, setType] = useState<ScheduleType>('once');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  // Parse initial value
  useEffect(() => {
    try {
      if (!value) return;
      
      // Check if it's a JSON string (recurring)
      if (value.startsWith('{')) {
        const parsed = JSON.parse(value);
        setType(parsed.type);
        setTime(parsed.time);
        if (parsed.days) setSelectedDays(parsed.days);
      } else {
        // It's a date string
        setType('once');
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
            // Format for inputs
            const iso = d.toISOString();
            setDate(iso.split('T')[0]);
            setTime(d.toTimeString().slice(0, 5));
        }
      }
    } catch (e) {
      // Fallback
      setType('once');
    }
  }, []);

  // Update parent when local state changes
  useEffect(() => {
    if (type === 'once') {
      if (date && time) {
        onChange(`${date}T${time}`);
      }
    } else {
      if (time) {
        onChange(JSON.stringify({
          type,
          time,
          days: type === 'weekly' ? selectedDays : undefined
        }));
      }
    }
  }, [type, date, time, selectedDays, onChange]);

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const days = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
      {/* Type Selector */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm mb-6">
        <button
          type="button"
          onClick={() => setType('once')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            type === 'once' ? 'bg-[#03C75A] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          한번만
        </button>
        <button
          type="button"
          onClick={() => setType('daily')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            type === 'daily' ? 'bg-[#03C75A] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          매일
        </button>
        <button
          type="button"
          onClick={() => setType('weekly')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            type === 'weekly' ? 'bg-[#03C75A] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          매주
        </button>
      </div>

      <AnimatePresence mode="wait">
        {type === 'once' ? (
          <motion.div
            key="once"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase ml-1">날짜</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-[#03C75A] outline-none text-gray-700 font-medium"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase ml-1">시간</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-[#03C75A] outline-none text-gray-700 font-medium"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="recurring"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {type === 'weekly' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase ml-1">요일 선택</label>
                <div className="flex justify-between gap-1">
                  {days.map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                        selectedDays.includes(index)
                          ? 'bg-[#03C75A] text-white shadow-md scale-110'
                          : 'bg-white text-gray-400 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase ml-1">
                {type === 'daily' ? '매일 실행할 시간' : '선택한 요일의 실행 시간'}
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-[#03C75A] outline-none text-gray-700 font-medium"
                />
              </div>
            </div>
            
            <div className="bg-[#03C75A]/5 rounded-xl p-4 flex items-start gap-3">
              <Repeat className="text-[#03C75A] mt-0.5" size={18} />
              <div className="text-sm text-[#03C75A]">
                <span className="font-bold">반복 설정: </span>
                {type === 'daily' ? (
                   <span>매일 <span className="font-bold">{time || '--:--'}</span>에 포스팅됩니다.</span>
                ) : (
                   <span>
                     매주 <span className="font-bold">{selectedDays.length > 0 ? selectedDays.map(d => days[d]).join(', ') : '...'}</span>요일 
                     <span className="font-bold"> {time || '--:--'}</span>에 포스팅됩니다.
                   </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
