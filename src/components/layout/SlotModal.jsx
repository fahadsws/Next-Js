// 'use client';
// import { createSlot, deleteSlot, updateSlot } from '@/lib/actions/slotaction';
// import { useSession } from 'next-auth/react';
// import { useEffect, useState, useMemo, useCallback } from 'react';
// import toast from 'react-hot-toast';

// export default function SlotModal({ setIsOpen, slots }) {
//   const [state, setState] = useState({
//     slots: [],
//     newTime: '',
//     selectedDays: [],
//     editingSlotId: null,
//     loading: false
//   });
//   const { data: session } = useSession();

//   const daysOfWeek = useMemo(() => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], []);

//   useEffect(() => {
//     if (slots?.length) {
//       const formatted = slots.map((slot) => ({
//         ...slot,
//         days: typeof slot.day === 'string' ? slot.day.split(',').map(Number) : slot.days,
//       }));
//       setState(prev => ({ ...prev, slots: formatted }));
//     }
//   }, [slots]);

//   const toggleDay = useCallback((dayNumber) => {
//     setState(prev => ({
//       ...prev,
//       selectedDays: prev.selectedDays.includes(dayNumber)
//         ? prev.selectedDays.filter((d) => d !== dayNumber)
//         : [...prev.selectedDays, dayNumber]
//     }));
//   }, []);

//   const handleSubmit = useCallback(async () => {
//     if (!state.newTime || state.selectedDays.length === 0) return;
//     setState(prev => ({ ...prev, loading: true }));

//     try {
//       if (state.editingSlotId !== null) {
//         // Update Slot
//         const response = await updateSlot(state.editingSlotId, state.selectedDays, session?.uniid);
//         toast.success(response?.message || 'Slot updated successfully');

//         setState(prev => ({
//           ...prev,
//           slots: prev.slots.map(slot =>
//             slot.id === state.editingSlotId
//               ? { ...slot, time: state.newTime, days: state.selectedDays }
//               : slot
//           ),
//           newTime: '',
//           selectedDays: [],
//           editingSlotId: null,
//           loading: false,
//         }));
//       } else {
//         // Create New Slot
//         const response = await createSlot(state.newTime, state.selectedDays, session?.uniid);
//         toast.success(response?.message || 'Slot added successfully');
//         setState(prev => ({
//           ...prev,
//           slots: [...prev.slots, { time: state.newTime, days: state.selectedDays }],
//           newTime: '',
//           selectedDays: [],
//           loading: false
//         }));
//       }
//     } catch (err) {
//       setState(prev => ({ ...prev, loading: false }));
//       toast.error('Something went wrong!');
//     }
//   }, [state.newTime, state.selectedDays, state.editingSlotId, session?.uniid]);

//   const handleEdit = (slot, id) => {
//     setState(prev => ({
//       ...prev,
//       newTime: slot.time,
//       selectedDays: slot.days,
//       editingSlotId: id,
//     }));
//   };

//   const totalSlots = useMemo(() =>
//     state.slots.reduce((total, slot) => total + slot.days.length, 0),
//     [state.slots]
//   );

//   const DeleteSlot = async (id) => {
//     try {
//       const response = await deleteSlot(id);
//       setIsOpen(false)
//       toast.success(response?.message || 'Slot deleted successfully');
//     } catch (err) {
//       toast.error('Something went wrong!');
//     }
//   }
//   return (
//     <div className="fixed inset-0 z-10 bg-gray-700/40 flex items-start justify-center p-6 overflow-y-auto">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative">

//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">🗓️ Weekly Post Scheduler</h2>
//           <button
//             onClick={() => setIsOpen(false)}
//             className="text-gray-500 hover:text-red-500 transition text-xl"
//           >
//             ✖️
//           </button>
//         </div>

//         <p className="text-gray-600 mb-6">
//           You currently have <span className="text-blue-600 font-bold">{totalSlots}</span> scheduled posts this week.
//         </p>

//         <div className="overflow-x-auto rounded-lg border mb-10">
//           <table className="w-full text-sm text-center">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-3 border">Time</th>
//                 {daysOfWeek.map((day, idx) => (
//                   <th key={idx} className="p-3 border">{day}</th>
//                 ))}
//                 <th className="p-3 border">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {state.slots.map((slot, idx) => (
//                 <tr key={idx} className="hover:bg-gray-50">
//                   <td className="p-2 border font-medium">{slot.time}</td>
//                   {daysOfWeek.map((_, dayIdx) => (
//                     <td key={dayIdx} className="p-2 border">
//                       {slot.days.includes(dayIdx + 1) ? '✔️' : ''}
//                     </td>
//                   ))}
//                   <td className="p-2 border ">
//                     <button
//                       onClick={() => handleEdit(slot, slot.id)}
//                       className="text-blue-500 hover:underline text-sm me-3"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => DeleteSlot(slot.id)}
//                       className="text-red-500 hover:underline text-sm"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div className="space-y-6">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
//             <label className="text-sm font-medium text-gray-700">Select Time:</label>
//             <input
//               type="time"
//               value={state.newTime}
//               onChange={(e) => setState(prev => ({ ...prev, newTime: e.target.value }))}
//               className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>

//           {state.newTime && (
//             <>
//               <label className="text-sm font-medium text-gray-700">Select Days:</label>
//               <div className="flex flex-wrap gap-3">
//                 {daysOfWeek.map((day, index) => (
//                   <label key={index} className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       checked={state.selectedDays.includes(index + 1)}
//                       onChange={() => toggleDay(index + 1)}
//                       className="accent-blue-600"
//                     />
//                     <span className="text-gray-700 text-sm">{day}</span>
//                   </label>
//                 ))}
//               </div>
//             </>
//           )}

//           <div className="pt-4">
//             <button
//               onClick={handleSubmit}
//               disabled={!state.newTime || state.selectedDays.length === 0 || state.loading}
//               className={`px-6 py-2.5 text-sm font-semibold rounded-md transition 
//                 ${state.loading || !state.newTime || state.selectedDays.length === 0
//                   ? 'bg-gray-300 cursor-not-allowed'
//                   : state.editingSlotId !== null
//                     ? 'bg-yellow-500 text-white hover:bg-yellow-600'
//                     : 'bg-blue-600 text-white hover:bg-blue-700'
//                 }`}
//             >
//               {state.loading ? 'Saving...' : state.editingSlotId !== null ? 'Update Slot' : '➕ Add Slot'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';
import { createSlot, deleteSlot, updateSlot } from '@/lib/actions/slotaction';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';

export default function SlotModal({ setIsOpen, slots }) {
  const [state, setState] = useState({
    slots: [],
    newTime: '',
    selectedDays: [],
    editingSlotId: null,
    loading: false
  });
  const { data: session } = useSession();

  // Update daysOfWeek so Sunday is 0, Monday is 1, and so on
  const daysOfWeek = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);

  // Format the slots, ensuring Sunday is 0 instead of 7
  useEffect(() => {
    if (slots?.length) {
      const formatted = slots.map((slot) => ({
        ...slot,
        days: typeof slot.day === 'string'
          ? slot.day.split(',').map(Number).map(d => (d === 7 ? 0 : d))  // Map Sunday (7) to 0
          : slot.days,
      }));
      setState(prev => ({ ...prev, slots: formatted }));
    }
  }, [slots]);

  // Toggle day selection for the new slot or editing
  const toggleDay = useCallback((dayNumber) => {
    setState(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayNumber)
        ? prev.selectedDays.filter((d) => d !== dayNumber)
        : [...prev.selectedDays, dayNumber]
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!state.newTime || state.selectedDays.length === 0) return;
    setState(prev => ({ ...prev, loading: true }));

    try {
      if (state.editingSlotId !== null) {
        // Update Slot
        const response = await updateSlot(state.editingSlotId, state.selectedDays, session?.uniid);
        toast.success(response?.message || 'Slot updated successfully');

        setState(prev => ({
          ...prev,
          slots: prev.slots.map(slot =>
            slot.id === state.editingSlotId
              ? { ...slot, time: state.newTime, days: state.selectedDays }
              : slot
          ),
          newTime: '',
          selectedDays: [],
          editingSlotId: null,
          loading: false,
        }));
      } else {
        // Create New Slot
        const response = await createSlot(state.newTime, state.selectedDays, session?.uniid);
        toast.success(response?.message || 'Slot added successfully');
        setState(prev => ({
          ...prev,
          slots: [...prev.slots, { time: state.newTime, days: state.selectedDays }],
          newTime: '',
          selectedDays: [],
          loading: false
        }));
      }
    } catch (err) {
      setState(prev => ({ ...prev, loading: false }));
      toast.error('Something went wrong!');
    }
  }, [state.newTime, state.selectedDays, state.editingSlotId, session?.uniid]);

  const handleEdit = (slot, id) => {
    setState(prev => ({
      ...prev,
      newTime: slot.time,
      selectedDays: slot.days,
      editingSlotId: id,
    }));
  };

  // Calculate total number of slots based on selected days
  const totalSlots = useMemo(() =>
    state.slots.reduce((total, slot) => total + slot.days.length, 0),
    [state.slots]
  );

  const DeleteSlot = async (id) => {
    try {
      const response = await deleteSlot(id);
      setIsOpen(false);
      toast.success(response?.message || 'Slot deleted successfully');
    } catch (err) {
      toast.error('Something went wrong!');
    }
  };

  return (
    <div className="fixed inset-0 z-10 bg-gray-700/40 flex items-start justify-center p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🗓️ Weekly Post Scheduler</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-red-500 transition text-xl"
          >
            ✖️
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          You currently have <span className="text-blue-600 font-bold">{totalSlots}</span> scheduled posts this week.
        </p>

        <div className="overflow-x-auto rounded-lg border mb-10">
          <table className="w-full text-sm text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Time</th>
                {daysOfWeek.map((day, idx) => (
                  <th key={idx} className="p-3 border">{day}</th>
                ))}
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.slots.map((slot, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-2 border font-medium">{slot.time}</td>
                  {daysOfWeek.map((_, dayIdx) => (
                    <td key={dayIdx} className="p-2 border">
                      {slot.days.includes(dayIdx) ? '✔️' : ''}
                    </td>
                  ))}
                  <td className="p-2 border">
                    <button
                      onClick={() => handleEdit(slot, slot.id)}
                      className="text-blue-500 hover:underline text-sm me-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => DeleteSlot(slot.id)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <label className="text-sm font-medium text-gray-700">Select Time:</label>
            <input
              type="time"
              value={state.newTime}
              onChange={(e) => setState(prev => ({ ...prev, newTime: e.target.value }))}
              className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {state.newTime && (
            <>
              <label className="text-sm font-medium text-gray-700">Select Days:</label>
              <div className="flex flex-wrap gap-3">
                {daysOfWeek.map((day, index) => (
                  <label key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state.selectedDays.includes(index)}  // Check against index
                      onChange={() => toggleDay(index)}  // Toggle based on index
                      className="accent-blue-600"
                    />
                    <span className="text-gray-700 text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={!state.newTime || state.selectedDays.length === 0 || state.loading}
              className={`px-6 py-2.5 text-sm font-semibold rounded-md transition 
                ${state.loading || !state.newTime || state.selectedDays.length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : state.editingSlotId !== null
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              {state.loading ? 'Saving...' : state.editingSlotId !== null ? 'Update Slot' : '➕ Add Slot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
