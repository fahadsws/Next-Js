import { DateTime } from 'luxon';
import prisma from "@/lib/api/prisma";
import { NextResponse } from 'next/server';


const getISTTime = () => {
  return DateTime.now().setZone('Asia/Kolkata');
};

const postToLinkedIn = async (text, id, accessToken, image_id) => {
  try {
    const body = {
      author: `urn:li:person:${id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: image_id ? 'IMAGE' : 'NONE',
          media: image_id ? [{ status: 'READY', media: `${image_id}` }] : [],
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(JSON.stringify(await response.json()));
    return await response.json();

  } catch (error) {
    console.error('LinkedIn Post Error:', error.message);
    return null;
  }
};

export async function GET(request) {
  if (request.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = getISTTime();
    const currentHour = now.hour;
    const currentMinute = now.minute;
    const todayDate = new Date().toISOString().slice(0, 10);
    const day = ((new Date().getDay() + 6) % 7) + 1;

    const posts = await prisma.$queryRaw`
      SELECT 
        p.id AS post_id, 
        p.content, 
        p.is_slot, 
        s.date,
        u.accessToken, 
        u.uniid AS linkedin_id, 
        s.time,
        s.is_schedule,
        p.image_id
      FROM posts p
      JOIN users u ON p.author = u.uniid
      LEFT JOIN slots s ON p.is_slot = s.id
      WHERE p.is_post = 0
      AND (
        (p.is_slot AND s.is_schedule = 1 AND s.date = ${todayDate})
        OR 
        (s.is_schedule = 0 AND (p.is_slot IS NOT NULL AND FIND_IN_SET(${day}, s.day) > 0))
        OR
        (p.is_slot = 0)
      )
    `;

    for (const post of posts) {
      const { post_id, content, accessToken, linkedin_id, is_slot, image_id, time } = post;

      if (!accessToken || !linkedin_id) continue;

      if (is_slot && time) {
        const [slotHour, slotMinute] = time.split(':').map(Number);
        if (slotHour !== currentHour || slotMinute !== currentMinute) continue;
      }

      const response = await postToLinkedIn(content || 'Default content', linkedin_id, accessToken, image_id);
      if (response) {
        await prisma.$executeRaw`UPDATE posts SET is_post = 1 WHERE id = ${post_id}`;
        console.log(`✅ Posted: ${post_id}`);
      } else {
        console.warn(`❌ Failed post: ${post_id}`);
      }
     
    }
    return NextResponse.json({ status: true, }, { status: 200 });
  } catch (error) {
    console.error('🔥 Error in LinkedIn Cron:', error);
    return NextResponse.json({ status: false, error: error }, { status: 500 });
  }
}
