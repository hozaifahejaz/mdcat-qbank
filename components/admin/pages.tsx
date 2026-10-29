"use client";

import AdminFrame from "@/components/admin/AdminFrame";
import Experiments from "@/components/admin/Experiments";
import Overview from "@/components/admin/Overview";
import Questions from "@/components/admin/Questions";
import Reports from "@/components/admin/Reports";
import Users from "@/components/admin/Users";
import Visitors from "@/components/admin/Visitors";
import Waitlist from "@/components/admin/Waitlist";
import RevealScreen from "@/components/screens/RevealScreen";

/* One per /admin route, so the (server) page files don't pass functions to client components. */
export const OverviewPage = () => <AdminFrame active="/admin">{(user) => <Overview user={user} />}</AdminFrame>;
export const QuestionsPage = () => <AdminFrame active="/admin/questions">{(user) => <Questions user={user} />}</AdminFrame>;
export const UsersPage = () => <AdminFrame active="/admin/users" adminOnly>{(user) => <Users user={user} />}</AdminFrame>;
export const VisitorsPage = () => <AdminFrame active="/admin/visitors" adminOnly>{() => <Visitors />}</AdminFrame>;
export const RevealPage = () => <AdminFrame active="/admin/reveal" adminOnly>{() => <RevealScreen />}</AdminFrame>;
export const ExperimentsPage = () => <AdminFrame active="/admin/experiments" adminOnly>{() => <Experiments />}</AdminFrame>;
export const ReportsPage = () => <AdminFrame active="/admin/reports" reviewerOnly>{() => <Reports />}</AdminFrame>;
export const WaitlistPage = () => <AdminFrame active="/admin/waitlist" adminOnly>{() => <Waitlist />}</AdminFrame>;
