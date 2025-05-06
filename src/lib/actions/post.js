'use server';
import { revalidatePath } from "next/cache";
import prisma from "../api/prisma";

import { verifyLinkedInToken } from '@/middleware/verifyLinkedInToken';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import path from 'node:path';
import fs from 'node:fs';
import { time } from "node:console";

export async function createSlot(time, date, user_id, content, id, slot_id = 0) {
    try {
        let slot;
        let post;
        if (time && date) {
            slot = await prisma.slots.findUnique({
                where: { id: slot_id },
            });
            if (!slot) {
                slot = await prisma.slots.create({
                    data: {
                        time,
                        date,
                        user_id,
                        is_schedule: 1,
                    },
                });
            }
        }
        if (id) {
            post = await prisma.posts.update({
                where: { id },
                data: {
                    content: content,
                },
            });
        } else {
            post = await prisma.posts.create({
                data: {
                    author: user_id,
                    content,
                    is_slot: slot?.id || 0,
                    upload_id: null,
                    image_id: null,
                    is_file: 0,
                    is_draft: slot?.id ? 0 : 1,
                },
            });
        }
        revalidatePath("/")
        return { id: post?.id, slot_id: slot?.id };
    } catch (error) {
        console.log(error);
        return false;
    }
}
export async function deletePost(id, slotId) {
    try {
        if (slotId) {
            await prisma.slots.delete({
                where: { id: slotId },
            });
        }
        const post = await prisma.posts.delete({
            where: { id },
        });
        revalidatePath("/")
        return post;
    } catch (error) {
        return false;
    }
}

// New 01-05-25
export async function createPostAction(payload, token) {
    try {
        if (!token) {
            throw new Error('Unauthorized');
        }

        const verified = await verifyLinkedInToken(token);
        const { content, is_slot, time, date, is_schedule, image, id } = payload;

        let slotId = null;
        let imageUpload;

        if (image) {
            imageUpload = await Upload(image, verified?.data.linkedinId);
        }

        if (is_schedule && time && date) {
            const slot = await prisma.slots.create({
                data: {
                    time,
                    date,
                    user_id: verified?.data.linkedinId,
                    is_schedule: 1,
                },
            });
            slotId = slot.id;
        }

        if (is_slot && !slotId) {
            slotId = is_slot;
        }

        let post;

        if (id) {
            post = await prisma.posts.update({
                where: { id },
                data: {
                    content,
                    is_slot: slotId || is_slot || 0,
                    upload_id: imageUpload?.url ?? undefined,
                    image_id: imageUpload?.data ?? undefined,
                    is_file: imageUpload?.data ? 1 : 0,
                    is_draft: 0,
                },
            });
        } else {
            post = await prisma.posts.create({
                data: {
                    author: verified?.data.linkedinId,
                    content,
                    is_slot: slotId || 0,
                    upload_id: imageUpload?.url ?? null,
                    image_id: imageUpload?.data ?? null,
                    is_file: imageUpload?.data ? 1 : 0,
                },
            });
        }

        // Revalidate the homepage or feed where posts show
        revalidatePath('/'); // Update this to actual post feed path

        return {
            status: true,
            message: slotId
                ? is_schedule
                    ? 'Post Created on Schedule successfully'
                    : 'Post Created on Slot successfully'
                : 'Post Created successfully',
            data: post,
        };
    } catch (err) {
        console.error('Server Action Create Post Error:', err);
        return {
            status: false,
            error: err.message,
        };
    }
}

async function Upload(image_path, linkedinId) {
    const session = await getServerSession(authOptions);
    const registerUploadRes = await fetch(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${session?.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                registerUploadRequest: {
                    recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                    owner: `urn:li:person:${linkedinId}`,
                    serviceRelationships: [
                        {
                            relationshipType: 'OWNER',
                            identifier: 'urn:li:userGeneratedContent',
                        },
                    ],
                },
            }),
        }
    );

    const registerData = await registerUploadRes.json();

    const uploadUrl =
        registerData.value.uploadMechanism[
            'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
        ].uploadUrl;
    const asset = registerData.value.asset;
    const imagePath = path.join(process.cwd(), 'public', image_path);
    const imageBuffer = fs.readFileSync(imagePath);

    const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            'Content-Type': 'image/jpeg',
            'media-type-family': 'STILLIMAGE',
        },
        body: imageBuffer,
    });

    if (!uploadRes.ok) {
        return false;
    }

    return {
        data: asset,
        url: uploadUrl,
    };
}

// export async function getNextFreeSlot(user_id) {
//     try {
//         // STEP 1: Get today's day number (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
//         const today = new Date();
//         const todayDay = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

//         // STEP 2: Fetch the next available slot for the next few days (e.g., next 7 days)
//         const slots = await prisma.slots.findMany({
//             where: {
//                 user_id,
//                 is_schedule: 0, // Unscheduled slots
//                 day: {
//                     // Include any day within the next 7 days
//                     contains: String(todayDay), // Check if the slot's day includes today's day
//                 },
//             },
//             orderBy: [
//                 { time: 'asc' }, // Get the earliest available slot
//             ],
//         });

//         if (!slots || slots.length === 0) {
//             return {
//                 status: false,
//                 error: 'No available slots in the coming days.',
//             };
//         }

//         // STEP 3: Iterate through the slots and return the first available slot in the next 7 days
//         for (const slot of slots) {
//             // Calculate the date for this slot
//             const slotDay = parseInt(slot.day); // Convert slot day to integer (e.g., Monday = 1)
//             const daysToAdd = (slotDay + 7 - todayDay) % 7 || 7; // Ensure it gets a day in the future
//             const nextDate = new Date();
//             nextDate.setDate(today.getDate() + daysToAdd); // Add calculated days to get the future date

//             const formattedDate = nextDate.toISOString().split('T')[0]; // Format the date as YYYY-MM-DD

//             return {
//                 status: true,
//                 data: {
//                     time: slot.time,
//                     date: formattedDate,
//                 },
//             };
//         }

//         // STEP 4: If no slots found in the coming days
//         return {
//             status: false,
//             error: 'No available slot in the next 7 days.',
//         };

//     } catch (err) {
//         console.error('Error fetching next free slot:', err);
//         return {
//             status: false,
//             error: err.message,
//         };
//     }
// }

// export async function getNextFreeSlot(user_id) {
//     const today = new Date();
//     const todayDay = today.getDay(); // Get today's day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
//     const currentTime = today.getHours() * 60 + today.getMinutes(); // Current time in minutes

//     // Function to get slots for a specific day
//     async function getSlotsForDay(day) {
//         return await prisma.slots.findMany({
//             where: {
//                 user_id,
//                 is_schedule: 0,
//                 day: {
//                     contains: String(day), // Check if the slot's day includes this specific day
//                 },
//             },
//             orderBy: [
//                 { time: 'asc' }, // Sort by time ascending
//             ],
//         });
//     }

//     async function getNextAvailableSlot() {
//         for (let i = 1; i <= 7; i++) { // Start from the next day
//             const day = (todayDay + i) % 7;
//             const slots = await getSlotsForDay(day);

//             // Filter slots where 'day' field includes this exact day (as a number in comma-separated string)
//             const dayMatchingSlots = slots.filter(slot => {
//                 const daysArray = slot.day.split(',').map(d => parseInt(d.trim()));
//                 return daysArray.includes(day);
//             });

//             if (dayMatchingSlots.length > 0) {
//                 const nextSlot = dayMatchingSlots[0]; // First available time (already ordered)
//                 const formattedDate = new Date();
//                 formattedDate.setDate(formattedDate.getDate() + i); // i days from today

//                 return {
//                     status: true,
//                     data: {
//                         time: nextSlot.time,
//                         date: formattedDate.toISOString().split('T')[0],
//                     }
//                 };
//             }
//         }

//         return { status: false, message: 'No available slots found.' };
//     }



//     // Get today’s slots
//     const todaySlots = await getSlotsForDay(todayDay);

//     // Filter out the passed slots for today
//     const validTodaySlots = todaySlots.filter(slot => {
//         const [hours, minutes] = slot.time.split(':').map(Number);
//         const slotTime = hours * 60 + minutes;
//         return slotTime >= currentTime; // Keep only future slots
//     });

//     if (validTodaySlots.length > 0) {
//         // Return the first available slot for today
//         const nextSlot = validTodaySlots[0];
//         return {
//             status: true,
//             data: {
//                 time: nextSlot.time,
//                 date: today.toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
//             },
//         };
//     } else {
//         // If all slots for today have passed, look for the next available day
//         return await getNextAvailableSlot();
//     }
// }

export async function getNextFreeSlot(user_id) {
    const today = new Date();
    const todayDay = today.getDay();
    const currentTime = today.getHours() * 60 + today.getMinutes();

    // Check if a post already scheduled this slot on this date
    async function isSlotUsedInPost(slotId, date) {
        const used = await prisma.posts.findFirst({
            where: {
                is_slot: slotId,
            }
        });
        return !!used;
    }

    // Check if a slot already exists with the same time and exact date
    async function doesSlotExistWithDate(time, date) {
        const existing = await prisma.slots.findFirst({
            where: {
                user_id,
                time: time,
                date: date,
            }
        });
        return !!existing;
    }

    async function getSlotsForDay(day) {
        return await prisma.slots.findMany({
            where: {
                user_id,
                is_schedule: 0,
                day: {
                    contains: String(day),
                },
            },
            orderBy: [
                { time: 'asc' },
            ],
        });
    }

    async function getNextAvailableSlot() {
        for (let i = 1; i <= 7; i++) {
            const day = (todayDay + i) % 7;
            const slots = await getSlotsForDay(day);
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + i);
            const formattedDate = targetDate.toISOString().split('T')[0];

            const dayMatchingSlots = slots.filter(slot => {
                const daysArray = slot.day.split(',').map(d => parseInt(d.trim()));
                return daysArray.includes(day);
            });

            for (const slot of dayMatchingSlots) {
                const isUsedInPost = await isSlotUsedInPost(slot.id, formattedDate);
                const existsWithDate = await doesSlotExistWithDate(slot.time, formattedDate);

                if (!isUsedInPost && !existsWithDate) {
                    return {
                        status: true,
                        data: {
                            time: slot.time,
                            date: formattedDate,
                        }
                    };
                }
            }
        }

        return { status: false, message: 'No available slots found.' };
    }

    const todaySlots = await getSlotsForDay(todayDay);
    const formattedToday = today.toISOString().split('T')[0];

    const validTodaySlots = todaySlots.filter(slot => {
        const [hours, minutes] = slot.time.split(':').map(Number);
        const slotTime = hours * 60 + minutes;
        return slotTime >= currentTime;
    });

    for (const slot of validTodaySlots) {
        const isUsedInPost = await isSlotUsedInPost(slot.id, formattedToday);
        const existsWithDate = await doesSlotExistWithDate(slot.time, formattedToday);

        if (!isUsedInPost && !existsWithDate) {
            return {
                status: true,
                data: {
                    time: slot.time,
                    date: formattedToday,
                },
            };
        }
    }

    return await getNextAvailableSlot();
}
