
import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from '@/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { getTranslations } from 'next-intl/server';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getAllBookings, getLocations, getUsers } from '@/lib/supabase/server';
import { DashboardClientContent } from '@/components/dashboard-client-content';

export default async function DashboardPage() {
    const t = await getTranslations('DashboardPage');
    const tloc = await getTranslations('LocationNames');

    // Fetch data on the server
    const initialBookings = await getAllBookings();
    const initialLocations = await getLocations();
    const initialUsers = await getUsers();

    return (
        <div className="flex-1 grid md:grid-cols-3 gap-6 p-4 sm:p-6 lg:p-8">
            <Suspense fallback={<div className="md:col-span-3">Loading...</div>}>
                <DashboardClientContent
                    initialBookings={initialBookings}
                    initialLocations={initialLocations}
                    initialUsers={initialUsers}
                />
            </Suspense>
        </div>
    );
}
