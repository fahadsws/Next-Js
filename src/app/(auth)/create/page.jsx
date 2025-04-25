import TextFormatterClient from "@/components/Front/TextFormatterClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/api/prisma";
import { getISTTime } from "@/lib/api/user";
import MainWrapper from "../components/MainWrapper";
export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const currentISTTime = getISTTime().toFormat('HH:mm');
  const slots = await prisma.slots.findMany({
    where: {
      user_id: session?.uniid,
      is_schedule: 0,
    }
  });
  const queslots = slots.filter(slot => slot.time >= currentISTTime);
  return (
    <main className="my-20 ">
      <TextFormatterClient slot={queslots} />
    </main>
  )
}
