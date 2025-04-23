import { NextResponse } from "next/server";

export async function verifyLinkedInToken(authHeader) {
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;
  try {
    const linkedInRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!linkedInRes.ok) {
      throw new Error("LinkedIn token is invalid");
    }
    const profile = await linkedInRes.json();

    return {
      status: true,
      data: {
        linkedinId: profile.sub,
        name: profile.name,
      },
    };
  } catch (err) {
    return NextResponse.json({ status: 401, message: "Invalid or expired LinkedIn token" }, { status: 401 });
  }
} 