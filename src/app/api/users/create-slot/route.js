import { NextResponse } from 'next/server';
import prisma from '@/lib/api/prisma';
import { verifyLinkedInToken } from '@/middleware/verifyLinkedInToken';
import { revalidatePath } from 'next/cache';

export async function POST(request) {
    try {
        const token = request.headers.get('authorization');
        const verified = await verifyLinkedInToken(token);
        if (!verified) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const { time, day } = body;
        const days = day.join(',');
        const slot = await prisma.slots.create({
            data: {
                time,
                day: days,
                user_id: verified?.data.linkedinId,
                is_schedule: 0
            }
        });
        revalidatePath("/")
        return NextResponse.json({
            status: true,
            message: "Slot Added successfully",
            data: slot
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 