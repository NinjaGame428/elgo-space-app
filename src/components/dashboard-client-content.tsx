
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import type { Booking, Location, User, EmailTemplate } from '@/lib/types';
import { Link } from '@/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Pencil, Trash2, CheckCircle, XCircle, User as UserIcon, Mail } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { fr, enUS } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface DashboardData {
    bookings: Booking[];
    locations: Location[];
    users: User[];
}
interface DashboardClientContentProps {
    initialData: DashboardData;
}

function EmailTemplatesManager() {
    const t = useTranslations('DashboardPage');
    const { toast } = useToast();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function fetchTemplates() {
            try {
                const res = await fetch('/api/email-templates');
                if (!res.ok) throw new Error('Failed to fetch templates');
                const data = await res.json();
                setTemplates(data);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load email templates.' });
            } finally {
                setIsLoading(false);
            }
        }
        fetchTemplates();
    }, [toast]);
    
    const handleTemplateChange = (templateName: string, field: 'subject' | 'body', value: string) => {
        setTemplates(currentTemplates => 
            currentTemplates.map(t => 
                t.name === templateName ? { ...t, [field]: value } : t
            )
        );
    };

    const handleSaveAllTemplates = async () => {
        setIsSaving(true);
        try {
            for (const template of templates) {
                const res = await fetch(`/api/email-templates/${template.name}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subject: template.subject, body: template.body }),
                });
                if (!res.ok) {
                    throw new Error(`Failed to save "${template.name}" template`);
                }
            }
            toast({ title: 'Templates Saved', description: 'All email templates have been updated.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not save all email templates.' });
        } finally {
            setIsSaving(false);
        }
    };

    const getTemplateTitle = (name: string) => {
        switch (name) {
            case 'booking_pending': return t('templateBookingPending');
            case 'booking_approved': return t('templateBookingApproved');
            case 'booking_rescheduled': return t('templateBookingRescheduled');
            case 'booking_cancellation': return t('templateBookingCancellation');
            case 'booking_rejected': return t('templateBookingRejected');
            default: return name;
        }
    }
    
    const getTemplateDescription = (name: string) => {
        switch (name) {
            case 'booking_pending': return t('templateBookingPendingDesc');
            case 'booking_approved': return t('templateBookingApprovedDesc');
            case 'booking_rescheduled': return t('templateBookingRescheduledDesc');
            case 'booking_cancellation': return t('templateBookingCancellationDesc');
             case 'booking_rejected': return t('templateBookingRejectedDesc');
            default: return `Template for: ${name}`;
        }
    }

    if (isLoading) {
        return <p>{t('loading')}</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail /> {t('emailNotifications')}</CardTitle>
                <CardDescription>{t('emailNotificationsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {templates.map((template) => (
                    <Card key={template.name} className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-lg">{getTemplateTitle(template.name)}</CardTitle>
                            <CardDescription>{getTemplateDescription(template.name)}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <Label htmlFor={`subject-${template.name}`} className="font-semibold">{t('emailSubject')}</Label>
                                <Input 
                                    id={`subject-${template.name}`} 
                                    value={template.subject}
                                    onChange={(e) => handleTemplateChange(template.name, 'subject', e.target.value)}
                                    disabled={isSaving}
                                    className="bg-background"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`body-${template.name}`} className="font-semibold">{t('emailBody')}</Label>
                                <Textarea
                                     id={`body-${template.name}`}
                                     value={template.body}
                                     onChange={(e) => handleTemplateChange(template.name, 'body', e.target.value)}
                                     rows={6}
                                     disabled={isSaving}
                                     className="bg-background"
                                />
                                 <p className="text-xs text-muted-foreground mt-2">
                                    {t('templateVariables')}: {'{{name}}'}, {'{{locationName}}'}, {'{{date}}'}, {'{{startTime}}'}, {'{{endTime}}'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
            <CardFooter>
                 <Button onClick={handleSaveAllTemplates} disabled={isSaving || isLoading}>
                    {isSaving ? t('saving') : t('saveAllTemplates')}
                </Button>
            </CardFooter>
        </Card>
    );
}


export function DashboardClientContent({ initialData }: DashboardClientContentProps) {
    const t = useTranslations('DashboardPage');
    const tloc = useTranslations('LocationNames');
    const locale = useLocale();
    const router = useRouter();
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [bookings, setBookings] = useState<Booking[]>(initialData.bookings);
    const [locations, setLocations] = useState<Location[]>(initialData.locations);
    const [users, setUsers] = useState<User[]>(initialData.users);
    
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [selectedUserForEmail, setSelectedUserForEmail] = useState<User | null>(null);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    const dateLocale = locale === 'fr' ? fr : enUS;

    useEffect(() => {
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;

        if (userRole !== 'Admin') {
            router.push('/login');
            return;
        }
        setIsAdmin(true);
        setCurrentUserEmail(userEmail);
    }, [router]);

    const handleApproval = async (bookingId: string, status: 'approved' | 'rejected') => {
        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!response.ok) throw new Error('Failed to update status');

            setBookings(currentBookings =>
                currentBookings.map(b =>
                    b.id === bookingId ? { ...b, status } : b
                )
            );
            toast({ title: "Booking status updated." });
            setSelectedBooking(null);
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Could not update booking status." });
        }
    };
    
    const deleteLocation = async (locationId: string) => {
        try {
            const response = await fetch(`/api/locations/${locationId}`, { method: 'DELETE' });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || t('roomDeleteFailed'));
            }

            setLocations(locations.filter(l => l.id !== locationId));
            toast({ title: t('roomDeleted') });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        }
    };

    const deleteUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || t('userDeleteFailed'));
            }
            
            setUsers(users.filter(u => u.id !== userId));
            toast({ title: t('userDeleted') });
        } catch(error: any) {
             toast({ variant: 'destructive', title: "Error", description: error.message });
        }
    };

    const bookingsForSelectedDay = useMemo(() => {
        return bookings.filter(booking =>
            selectedDate && format(new Date(booking.startTime), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        ).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [bookings, selectedDate]);

    const bookedDates = useMemo(() => bookings.map(b => new Date(b.startTime)), [bookings]);

    const handleBookingClick = (booking: Booking) => {
        setSelectedBooking(booking);
    };
    
    const selectedBookingLocation = useMemo(() => {
        if (!selectedBooking) return null;
        return locations.find(l => l.id === selectedBooking.locationId);
    }, [selectedBooking, locations]);

    const handleOpenEmailDialog = (user: User) => {
        setSelectedUserForEmail(user);
        setEmailSubject('');
        setEmailBody('');
        setIsEmailDialogOpen(true);
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserForEmail || !emailSubject || !emailBody) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill out all fields.' });
            return;
        }
        
        setIsSendingEmail(true);
        try {
            const response = await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: selectedUserForEmail.email,
                    subject: emailSubject,
                    body: emailBody,
                }),
            });

            if (!response.ok) throw new Error('Failed to send email.');

            toast({ title: 'Email Sent', description: `Your message has been sent to ${selectedUserForEmail.email}.` });
            setIsEmailDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not send the email. Please try again.' });
        } finally {
            setIsSendingEmail(false);
        }
    };


    if (!isAdmin) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] col-span-3 text-muted-foreground">{t('loading')}</div>;
    }

    return (
        <div className="animate-fade-in-up">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t('adminDashboard')}</h1>
                <p className="text-lg text-muted-foreground">{t('dashboardDescription')}</p>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 max-w-sm mb-8">
                    <TabsTrigger value="dashboard">{t('mainDashboard')}</TabsTrigger>
                    <TabsTrigger value="emails">{t('emailNotifications')}</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                     <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('bookingCalendar')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            className="p-0"
                                            modifiers={{ booked: bookedDates }}
                                            modifiersClassNames={{ 
                                                booked: 'bg-orange-500 text-white hover:bg-orange-500/90 focus:bg-orange-500/90',
                                            }}
                                            locale={dateLocale}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('bookingsFor', { date: selectedDate ? format(selectedDate, 'PPP', { locale: dateLocale }) : '...' })}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-96">
                                        <div className="space-y-4 pr-4">
                                            {bookingsForSelectedDay.length > 0 ? (
                                                bookingsForSelectedDay.map(booking => {
                                                    const location = locations.find(l => l.id === booking.locationId);
                                                    return (
                                                        <div key={booking.id} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleBookingClick(booking)}>
                                                            <div>
                                                                <p className="font-semibold">{location ? tloc(location.name as any) : t('unknownLocation')}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')}
                                                                </p>
                                                                <p className="text-sm">{t('bookedBy', { email: booking.userEmail })}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={booking.status === 'approved' ? 'default' : booking.status === 'rejected' ? 'destructive' : 'secondary'}>{t(booking.status as any)}</Badge>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-muted-foreground text-center py-8">{t('noBookings')}</p>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>{t('roomManagement')}</CardTitle>
                                        <CardDescription>{t('roomManagementDescription')}</CardDescription>
                                    </div>
                                    <Button asChild size="sm">
                                        <Link href="/dashboard/rooms/add"><PlusCircle /> {t('addRoom')}</Link>
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
                                                    <TableCell className="font-medium">{tloc(location.name as any)}</TableCell>
                                                    <TableCell>{location.address}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="outline" size="icon" asChild>
                                                                <Link href={`/dashboard/rooms/${location.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
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
                                                        </div>
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
                                    <Button asChild size="sm">
                                        <Link href="/dashboard/users/add"><PlusCircle /> {t('addUser')}</Link>
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
                                                <TableRow key={user.id} className={cn(user.email === currentUserEmail && "bg-muted/50")}>
                                                    <TableCell className="font-medium flex items-center gap-2">
                                                        {user.name || 'N/A'}
                                                        {user.email === currentUserEmail && <UserIcon className="h-4 w-4 text-primary" />}
                                                    </TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell><Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                                                    <TableCell>{format(new Date(user.joined_at), 'yyyy-MM-dd')}</TableCell>
                                                    <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                            <Button variant="outline" size="icon" onClick={() => handleOpenEmailDialog(user)}>
                                                                <Mail className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="outline" size="icon" asChild>
                                                                <Link href={`/dashboard/users/${user.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="destructive" size="icon" disabled={user.email === currentUserEmail}><Trash2 className="h-4 w-4" /></Button>
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
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="emails">
                    <EmailTemplatesManager />
                </TabsContent>

            </Tabs>

            <Dialog open={!!selectedBooking} onOpenChange={(isOpen) => !isOpen && setSelectedBooking(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('bookingDetails')}</DialogTitle>
                        <DialogDescription>{t('bookingDetailsDescription')}</DialogDescription>
                    </DialogHeader>
                    {selectedBooking && (
                        <>
                        <div className="space-y-4 pt-4">
                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">{t('location')}</h4>
                                <p>{selectedBookingLocation ? tloc(selectedBookingLocation.name as any) : ''}</p>
                                <p className="text-sm text-muted-foreground">{selectedBookingLocation?.address}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">{t('user')}</h4>
                                <p>{selectedBooking.userEmail}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">{t('department')}</h4>
                                <p>{selectedBooking.department || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">{t('occasion')}</h4>
                                <p>{selectedBooking.occasion || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">{t('dateTime')}</h4>
                                <p>{format(new Date(selectedBooking.startTime), 'PPP, p')} - {format(new Date(selectedBooking.endTime), 'p')}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">{t('status')}</h4>
                                <Badge variant={
                                    selectedBooking.status === 'approved' ? 'default' :
                                    selectedBooking.status === 'rejected' ? 'destructive' : 'secondary'
                                }>{t(selectedBooking.status as any)}</Badge>
                            </div>
                        </div>
                         <DialogFooter>
                            {selectedBooking.status === 'pending' && (
                                <>
                                    <Button onClick={() => handleApproval(selectedBooking.id, 'rejected')} variant="outline"><XCircle/>{t('reject')}</Button>
                                    <Button onClick={() => handleApproval(selectedBooking.id, 'approved')}><CheckCircle/>{t('approve')}</Button>
                                </>
                            )}
                         </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleSendEmail}>
                        <DialogHeader>
                            <DialogTitle>{t('sendEmailTo', { name: selectedUserForEmail?.name || 'user' })}</DialogTitle>
                            <DialogDescription>
                               {t('sendEmailToDesc', { email: selectedUserForEmail?.email })}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email-subject" className="text-right">
                                    {t('emailSubject')}
                                </Label>
                                <Input
                                    id="email-subject"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email-body" className="text-right">
                                    {t('emailBody')}
                                </Label>
                                <Textarea
                                    id="email-body"
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    className="col-span-3"
                                    rows={6}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSendingEmail}>
                                {isSendingEmail ? t('sendingEmail') : t('sendEmail')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
