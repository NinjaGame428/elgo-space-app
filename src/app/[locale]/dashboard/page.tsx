
import { Suspense } from 'react';
import { getAllBookings, getLocations, getUsers } from '@/lib/supabase/server';
import { DashboardClientContent } from '@/components/dashboard-client-content';
import { Skeleton } from '@/components/ui/skeleton';

export default async function DashboardPage() {
    
    return (
        <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardDataFetcher />
            </Suspense>
        </div>
    );
}

async function DashboardDataFetcher() {
    const initialData = {
        bookings: await getAllBookings(),
        locations: await getLocations(),
        users: await getUsers(),
    };
    return <DashboardClientContent initialData={initialData} />
}

function DashboardSkeleton() {
    return (
        <div className="animate-pulse">
            <header className="mb-8">
                <Skeleton className="h-10 w-72 mb-2" />
                <Skeleton className="h-6 w-96" />
            </header>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                   <Skeleton className="h-96 w-full rounded-lg" />
                   <Skeleton className="h-64 w-full rounded-lg" />
                </div>
                 <div className="lg:col-span-2 space-y-8">
                   <Skeleton className="h-80 w-full rounded-lg" />
                   <Skeleton className="h-80 w-full rounded-lg" />
                </div>
            </div>
        </div>
    )
}
