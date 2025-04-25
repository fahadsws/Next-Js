import { PrismaClient } from '@prisma/client';
import { verifyLinkedInToken } from '@/middleware/verifyLinkedInToken';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
    if (request.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const verified = await verifyLinkedInToken(token);

        const posts = await prisma.posts.findMany({
            where: { author: verified?.data.linkedinId, is_post:1 },
        });

        return NextResponse.json(posts);

    } catch (err) {
        console.error('FETCH Post Error:', err);
        return NextResponse.json({ status: false, error: err.message }, { status: 500 });
    }
}