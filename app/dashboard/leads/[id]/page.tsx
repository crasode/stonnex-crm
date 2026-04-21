import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LeadDetail from "./LeadDetail";

export const dynamic = "force-dynamic";

export default async function LeadPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead) notFound();

  return <LeadDetail lead={lead} />;
}
