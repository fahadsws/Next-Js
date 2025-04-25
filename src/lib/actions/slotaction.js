'use server';
import { revalidatePath } from "next/cache";
import prisma from "../api/prisma";

export async function createSlot(time, day, user_id) {
    try {
        const days = day.join(',');
        const slot = await prisma.slots.create({
            data: {
                time,
                day: days,
                user_id,
                is_schedule: 0
            }
        });
        revalidatePath("/")
        return {
            status: true,
            message: "Slot Added successfully",
            data: slot
        };
    } catch (error) {
        return { message: 'Internal Server Error' };
    }
}

export const updateSlot = async (id, days, uniid) => {
    const updatedSlot = await prisma.slots.update({
        where: {
            id,
        },
        data: {
            day: days.join(','),
            user_id: uniid,
        },
    });
    revalidatePath("/")
    return {
        status: true,
        message: "Slot Updated successfully",
    };

};

export const deleteSlot = async (id) => {
    const deleteSlot = await prisma.slots.delete({
        where: {
            id,
        },
    });
    revalidatePath("/")
    return {
        status: true,
        message: "Slot Deleted successfully",
    };

};