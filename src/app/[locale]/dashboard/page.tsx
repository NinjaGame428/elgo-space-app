
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { bookings as initialBookings, locations as initialLocations, users as initialUsers } from "@/lib/data";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import type { Booking, Location, User } from '@/lib/types';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
    const t = useTranslations('DashboardPage');
    const router = useRouter();
    const { toast } = useToast();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const loggedInEmail = localStorage.getItem('userEmail');
        if (loggedInEmail !== 'test@example.com') {
            router.push('/login');
            return;
        }
        setIsAdmin(true);

        const storedBookings = localStorage.getItem('bookings');
        const storedLocations = localStorage.getItem('locations');
        const storedUsers = localStorage.getItem('users');

        setBookings(storedBookings ? JSON.parse(storedBookings) : initialBookings);
        setLocations(storedLocations ? JSON.parse(storedLocations) : initialLocations);
        setUsers(storedUsers ? JSON.parse(storedUsers) : initialUsers);

    }, [router]);

    useEffect(() => {
        if (isAdmin) {
            localStorage.setItem('bookings', JSON.stringify(bookings));
            localStorage.setItem('locations', JSON.stringify(locations));
            localStorage.setItem('users', JSON.stringify(users));
        }
    }, [bookings, locations, users, isAdmin]);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        router.push('/');
    };

    const handleApproval = (bookingId: string, status: 'approved' | 'rejected') => {
        setBookings(currentBookings =>
            currentBookings.map(b =>
                b.id === bookingId ? { ...b, status } : b
            )
        );
    };

    const deleteBooking = (bookingId: string) => {
        setBookings(bookings.filter(b => b.id !== bookingId));
        toast({ title: t('bookingDeleted') });
    };
    
    const deleteLocation = (locationId: string) => {
        setLocations(locations.filter(l => l.id !== locationId));
        toast({ title: t('roomDeleted') });
    };

    const deleteUser = (userId: string) => {
        setUsers(users.filter(u => u.id !== userId));
        toast({ title: t('userDeleted') });
    };

    const bookingsForSelectedDay = useMemo(() => {
        return bookings.filter(booking =>
            selectedDate && format(new Date(booking.startTime), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        );
    }, [bookings, selectedDate]);

    const bookedDates = useMemo(() => bookings.map(b => new Date(b.startTime)), [bookings]);

    if (!isAdmin) {
        return <div className="flex items-center justify-center min-h-screen">{t('loading')}</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="flex items-center justify-between p-4 border-b">
                <Link href="/" className="text-2xl font-bold">Lauft</Link>
                <h1 className="text-xl font-semibold">{t('adminDashboard')}</h1>
                <Button variant="outline" onClick={handleLogout}>{t('logout')}</Button>
            </header>

            <main className="flex-1 p-4 md:p-6 grid gap-6">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('bookingCalendar')}</CardTitle>
                                <CardDescription>{t('calendarDescription')}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="rounded-md border"
                                    modifiers={{ booked: bookedDates }}
                                    modifiersClassNames={{ booked: 'bg-primary/20' }}
                                />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('bookingsFor', { date: selectedDate ? format(selectedDate, 'PPP') : '...' })}</CardTitle>
                                <CardDescription>{t('bookingsDescription')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {bookingsForSelectedDay.length > 0 ? (
                                        bookingsForSelectedDay.map(booking => {
                                            const location = locations.find(l => l.id === booking.locationId);
                                            return (
                                                <div key={booking.id} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div>
                                                        <p className="font-semibold">{location?.name || t('unknownLocation')}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')}
                                                        </p>
                                                        <p className="text-sm">{t('bookedBy', { email: booking.userEmail })}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {booking.status === 'pending' && (
                                                            <>
                                                                <Button size="sm" onClick={() => handleApproval(booking.id, 'approved')}>{t('approve')}</Button>
                                                                <Button size="sm" variant="destructive" onClick={() => handleApproval(booking.id, 'rejected')}>{t('reject')}</Button>
                                                            </>
                                                        )}
                                                        {booking.status === 'approved' && <Badge>{t('approved')}</Badge>}
                                                        {booking.status === 'rejected' && <Badge variant="destructive">{t('rejected')}</Badge>}
                                                         <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                                                                    <AlertDialogDescription>{t('deleteBookingWarning')}</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => deleteBooking(booking.id)}>{t('delete')}</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-muted-foreground">{t('noBookings')}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{t('roomManagement')}</CardTitle>
                            <CardDescription>{t('roomManagementDescription')}</CardDescription>
                        </div>
                        <Button asChild>
                            <Link href="/dashboard/rooms/add">{t('addRoom')}</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('roomName')}</TableHead>
                                    <TableHead>{t('address')}</TableHead>
                                    <TableHead className="text-right">{t('actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {locations.map(location => (
                                    <TableRow key={location.id}>
                                        <TableCell className="font-medium">{location.name}</TableCell>
                                        <TableCell>{location.address}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/rooms/${location.id}/edit`}>{t('edit')}</Link>
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>{t('delete')}</DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                             <AlertDialogHeader>
                                                                <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                                                                <AlertDialogDescription>{t('deleteRoomWarning')}</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteLocation(location.id)}>{t('delete')}</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{t('userManagement')}</CardTitle>
                            <CardDescription>{t('userManagementDescription')}</CardDescription>
                        </div>
                        <Button asChild>
                            <Link href="/dashboard/users/add">{t('addUser')}</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('name')}</TableHead>
                                    <TableHead>{t('email')}</TableHead>
                                    <TableHead>{t('role')}</TableHead>
                                    <TableHead>{t('joined')}</TableHead>
                                    <TableHead className="text-right">{t('actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell><Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                                        <TableCell>{user.joined}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={user.email === 'test@example.com'}>
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/users/${user.id}/edit`}>{t('edit')}</Link>
                                                    </DropdownMenuItem>
                                                     <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                             <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={user.email === 'test@example.com'}>{t('delete')}</DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                             <AlertDialogHeader>
                                                                <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                                                                <AlertDialogDescription>{t('deleteUserWarning')}</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteUser(user.id)}>{t('delete')}</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
