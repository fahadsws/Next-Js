import { PrismaClient } from '@prisma/client';
import { verifyLinkedInToken } from '@/middleware/verifyLinkedInToken';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();


export async function POST(request) {


    if (request.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {

        const body = await request.json();
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const verified = await verifyLinkedInToken(token);
        const { content, is_slot, time, date, is_schedule, image } = body;



        let slotId = null;
        // let imageUpload;
        // if (image) {
        //     imageUpload = await Upload(image);
        // }

        if (is_schedule && time && date) {
            const slot = await prisma.slots.create({
                data: {
                    time,
                    date,
                    user_id: verified?.data.linkedinId,
                    is_schedule: 1,
                    upload_id: imageUpload?.url ?? 0,
                    image_id: imageUpload?.data ?? 0,
                },
            });
            slotId = slot.id;
        }

        if (is_slot && !slotId) {
            slotId = is_slot;
        }

        const post = await prisma.posts.create({
            data: {
                author: verified?.data.linkedinId,
                content,
                is_slot: slotId || 0,
            },
        });

        return NextResponse.json({
            status: true,
            message: slotId
                ? is_schedule
                    ? 'Post Created on Schedule successfully'
                    : 'Post Created on Slot successfully'
                : 'Post Created successfully',
            data: post,
        }, { status: 200 });
    } catch (err) {
        console.error('Create Post Error:', err);
        return NextResponse.json({ status: false, error: err.message }, { status: 500 });
    }
}


async function Upload(image_path) {
    const session = await getServerSession(authOptions);
    console.log('IMAGE',image_path)
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
                    owner: `urn:li:person:${session?.uniid}`,
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
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'image/jpeg',
            'media-type-family': 'STILLIMAGE',
        },
        body: imageBuffer,
    });
    if (!uploadRes.ok) {
        return false
    } else {
        return {
            data: asset,
            url: uploadUrl
        }
    }
}