
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import type { Location } from '@/lib/types';
import { allAmenities } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditRoomPage() {
    const t = useTranslations('EditRoomPage');
    const tloc = useTranslations('LocationNames');
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();

    const [location, setLocation] = useState<Location | null>(null);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (!id) return;

        async function fetchLocation() {
            try {
                const response = await fetch(`/api/locations/${id}`);
                if (!response.ok) throw new Error('Failed to fetch location data');
                const locationData: Location = await response.json();
                
                setLocation(locationData);
                setName(tloc(locationData.name as any));
                setAddress(locationData.address);
                setImageUrl(locationData.imageUrl || '');
                setSelectedAmenities(locationData.amenities.map(a => a.name));
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: t('roomNotFound') });
                router.push('/dashboard');
            } finally {
                setIsLoading(false);
            }
        }

        fetchLocation();

    }, [id, router, toast, t, tloc]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location) return;
        setIsLoading(true);

        try {
            const response = await fetch(`/api/locations/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, imageUrl, amenities: selectedAmenities.map(name => ({ name })) }),
            });

             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update room');
            }

            toast({
                title: t('roomUpdatedTitle'),
                description: t('roomUpdatedDescription'),
            });
            router.push('/dashboard');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Update failed',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAmenityChange = (amenityName: string) => {
        setSelectedAmenities(prev => 
            prev.includes(amenityName)
                ? prev.filter(a => a !== amenityName)
                : [...prev, amenityName]
        );
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
                <Card className="w-full max-w-3xl">
                    <CardHeader>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-5 w-64" />
                    </CardHeader>
                     <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                     </CardContent>
                     <CardFooter className="border-t pt-6">
                         <Skeleton className="h-12 w-36" />
                     </CardFooter>
                </Card>
             </div>
        )
    }

    if (!location) {
        return <div className="flex items-center justify-center min-h-screen">{t('roomNotFound')}</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-3xl animate-fade-in-up">
                 <CardHeader>
                    <div className="flex items-center justify-between">
                         <div>
                            <CardTitle className="text-2xl">{t('editRoomTitle')}</CardTitle>
                            <CardDescription>{t('editRoomDescription')}</CardDescription>
                         </div>
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard"><ArrowLeft /></Link>
                        </Button>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('roomNameLabel')}</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} required disabled/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">{t('addressLabel')}</Label>
                                <Input id="address" value={address} onChange={e => setAddress(e.target.value)} required disabled={isLoading} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('imageLabel')}</Label>
                            {imageUrl && (
                                <div className="mt-2 relative h-48 w-full rounded-lg overflow-hidden border">
                                    <Image src={imageUrl} alt="Room preview" layout="fill" objectFit="cover" />
                                </div>
                            )}
                            <Tabs defaultValue="url" className="pt-2">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="url">{t('urlTab')}</TabsTrigger>
                                    <TabsTrigger value="upload">{t('uploadTab')}</TabsTrigger>
                                </TabsList>
                                <TabsContent value="url" className="pt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="imageUrl" className="sr-only">{t('imageUrlLabel')}</Label>
                                        <Input id="imageUrl" placeholder="https://example.com/image.png" value={imageUrl} onChange={e => setImageUrl(e.target.value)} disabled={isLoading} />
                                    </div>
                                </TabsContent>
                                <TabsContent value="upload" className="pt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="imageUpload" className="sr-only">{t('imageUploadLabel')}</Label>
                                        <Input id="imageUpload" type="file" accept="image/*" onChange={handleImageUpload} disabled={isLoading} />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('amenitiesLabel')}</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                                {allAmenities.map(amenity => (
                                    <div key={amenity.name} className="flex items-center gap-2">
                                        <Checkbox
                                            id={amenity.name}
                                            checked={selectedAmenities.includes(amenity.name)}
                                            onCheckedChange={() => handleAmenityChange(amenity.name)}
                                            disabled={isLoading}
                                        />
                                        <Label htmlFor={amenity.name} className="font-normal cursor-pointer">{amenity.name}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                        <Button type="submit" size="lg" disabled={isLoading}>{isLoading ? t('saving') : t('saveChangesButton')}</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

    