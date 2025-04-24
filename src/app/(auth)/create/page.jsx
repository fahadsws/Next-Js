import TextFormatterClient from "@/components/Front/TextFormatterClient";
import SideBar from "../components/SideBar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...NextAuth]/route";
import prisma from "@/lib/api/prisma";
import { getISTTime } from "@/lib/api/user";
export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const currentISTTime = getISTTime().toFormat('HH:mm');
  const slots = await prisma.slots.findMany({
    where: {
      user_id: session?.uniid,
      is_schedule: 0,
    }
  });
  const queslots = await prisma.slots.findMany({
    where: {
      user_id: session?.uniid,
      is_schedule: 0,
      time: {
        gte: currentISTTime,
      },
    }
  });
  return (
    <main className="flex items-start">
      <SideBar slots={slots} />
      <div className="textformater my-20">
        <TextFormatterClient slot={queslots} />
      </div>
    </main>
  )
}
