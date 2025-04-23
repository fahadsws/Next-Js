import { apiFetch } from './client';
const { DateTime } = require('luxon');


export function createPost(endpoint, data, token) {
    return apiFetch(`${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

export function convertTo12Hour(time24) {
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
}

export const getISTTime = () => {
    return DateTime.now().setZone('Asia/Kolkata');
  };
