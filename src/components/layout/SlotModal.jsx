'use client';
import { createPost } from '@/lib/api/user';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';

export default function SlotModal({ setIsOpen, slots }) {
  const [state, setState] = useState({
    slots: [],
    newTime: '',
    selectedDays: [],
    loading: false
  });
  const { data: session } = useSession();

  const daysOfWeek = useMemo(() => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], []);

  useEffect(() => {
    if (slots?.length) {
      const formatted = slots.map((slot) => ({
        ...slot,
        days: typeof slot.day === 'string' ? slot.day.split(',').map(Number) : slot.days
      }));

      setState(prev => ({ ...prev, slots: formatted }));
    }
  }, [slots]);


  const toggleDay = useCallback((dayNumber) => {
    setState(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayNumber)
        ? prev.selectedDays.filter((d) => d !== dayNumber)
        : [...prev.selectedDays, dayNumber]
    }));
  }, []);


  const addSlot = useCallback(async () => {
    if (!state.newTime || state.selectedDays.length === 0) return;
    setState(prev => ({ ...prev, loading: true }));
    const payload = {
      time: state.newTime,
      day: state.selectedDays,
    };

    try {
      const response = await createPost('users/create-slot', payload, session?.accessToken);
      toast.success(response?.message);
      setState(prev => ({
        ...prev,
        slots: [...prev.slots, { time: state.newTime, days: state.selectedDays }],
        newTime: '',
        selectedDays: [],
        loading: false
      }));
    } catch (err) {
      setState(prev => ({ ...prev, loading: false }));
      toast.error(response?.message);
    }
  }, [state.newTime, state.selectedDays, session?.accessToken]);

  const totalSlots = useMemo(() =>
    state.slots.reduce((total, slot) => total + slot.days.length, 0),
    [state.slots]
  );

  return (
    <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true">
        <div className="max-w-5xl mx-auto mt-12 bg-gray-100 rounded-2xl shadow-lg p-10 border border-gray-200 relative">
          {/* Header with Close */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-semibold text-gray-800">
              🗓️ Weekly Post Scheduler
            </h1>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors text-xl"
              title="Close"
            >
              ✖️
            </button>
          </div>

          {/* Summary */}
          <p className="mb-6 text-gray-600">
            You currently have{" "}
            <span className="font-semibold text-blue-600">
              {totalSlots}
            </span>{" "}
            slots scheduled for the week.
          </p>

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg mb-8">
            <table className="min-w-full table-auto border-collapse text-sm text-center">
              <thead className="bg-gray-100 text-gray-700 border-b">
                <tr>
                  <th className="p-3 border">⏰ Time</th>
                  {daysOfWeek.map((day, idx) => (
                    <th key={idx} className="p-3 border">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {state.slots.map((slot, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 border font-medium">{slot.time}</td>
                    {daysOfWeek.map((_, dayIndex) => (
                      <td key={dayIndex} className="p-2 border text-lg">
                        {slot.days.includes(dayIndex + 1) ? '✔️' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Time & Day Selection */}
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0">
                Select Time:
              </label>
              <input
                type="time"
                value={state.newTime}
                onChange={(e) => setState(prev => ({ ...prev, newTime: e.target.value }))}
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {state.newTime && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Days:
                </label>
                <div className="flex flex-wrap gap-4">
                  {daysOfWeek.map((day, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={state.selectedDays.includes(index + 1)}
                        onChange={() => toggleDay(index + 1)}
                        className="accent-blue-600 w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Add Slot Button */}
            <div>
              <button
                onClick={addSlot}
                disabled={!state.newTime || state.selectedDays.length === 0 || state.loading}
                className={`px-5 py-2.5 text-sm font-medium rounded-md transition ${state.loading || !state.newTime || state.selectedDays.length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {state.loading ? 'Saving...' : '➕ Add Slot'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
