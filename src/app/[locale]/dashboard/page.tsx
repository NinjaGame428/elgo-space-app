
import { Suspense } from 'react';
import { getAllBookings, getLocations, getUsers } from '@/lib/supabase/server';
import { DashboardClientContent } from '@/components/dashboard-client-content';

export default async function DashboardPage() {
    const initialData = {
        bookings: await getAllBookings(),
        locations: await getLocations(),
        users: await getUsers(),
    };

    return (
        <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
            <Suspense fallback={<div className="text-center p-8">Loading dashboard...</div>}>
                <DashboardClientContent initialData={initialData} />
            </Suspense>
        </div>
    );
}
