
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Location } from '@/lib/types';
import { allAmenities, locations as initialLocations } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

export default function EditRoomPage() {
    const t = useTranslations('EditRoomPage');
    const tloc = useTranslations('LocationNames');
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();

    const [locations, setLocations] = useState<Location[]>([]);
    const [location, setLocation] = useState<Location | null>(null);

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    
    useEffect(() => {
        const storedLocations = localStorage.getItem('locations');
        const parsedLocations = storedLocations ? JSON.parse(storedLocations) : initialLocations;
        setLocations(parsedLocations);
        const foundLocation = parsedLocations.find((l: Location) => l.id === id);
        if (foundLocation) {
            setLocation(foundLocation);
            setName(tloc(foundLocation.name as any));
            setAddress(foundLocation.address);
            setImageUrl(foundLocation.imageUrl);
            setSelectedAmenities(foundLocation.amenities.map(a => a.name));
        } else {
            toast({ variant: 'destructive', title: t('roomNotFound') });
            router.push('/dashboard');
        }
    }, [id, router, toast, t, tloc]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!location) return;

        // Note: We are saving the English name back. 
        // For a real app, you would handle this differently,
        // perhaps by editing the translation files or having a different data structure.
        // But for this simulation, we'll just use the key.
        const updatedLocation: Location = {
            ...location,
            name: location.name, // Keep the key
            address,
            imageUrl,
            amenities: selectedAmenities.map(name => ({ name })),
        };
        
        const updatedLocations = locations.map(l => l.id === id ? updatedLocation : l);
        localStorage.setItem('locations', JSON.stringify(updatedLocations));

        toast({
            title: t('roomUpdatedTitle'),
            description: t('roomUpdatedDescription'),
        });
        router.push('/dashboard');
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

    if (!location) {
        return <div className="flex items-center justify-center min-h-screen">{t('loading')}</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>{t('editRoomTitle')}</CardTitle>
                        <CardDescription>{t('editRoomDescription')}</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('roomNameLabel')}</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} required disabled/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">{t('addressLabel')}</Label>
                                <Input id="address" value={address} onChange={e => setAddress(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('imageLabel')}</Label>
                                <Tabs defaultValue="url">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="url">{t('urlTab')}</TabsTrigger>
                                        <TabsTrigger value="upload">{t('uploadTab')}</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="url" className="pt-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="imageUrl" className="sr-only">{t('imageUrlLabel')}</Label>
                                            <Input id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="upload" className="pt-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="imageUpload" className="sr-only">{t('imageUploadLabel')}</Label>
                                            <Input id="imageUpload" type="file" accept="image/*" onChange={handleImageUpload} />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                                {imageUrl && (
                                    <div className="mt-4 relative h-48 w-full rounded-md overflow-hidden border">
                                        <Image src={imageUrl} alt="Room preview" layout="fill" objectFit="cover" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>{t('amenitiesLabel')}</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md">
                                    {allAmenities.map(amenity => (
                                        <div key={amenity.name} className="flex items-center gap-2">
                                            <Checkbox
                                                id={amenity.name}
                                                checked={selectedAmenities.includes(amenity.name)}
                                                onCheckedChange={() => handleAmenityChange(amenity.name)}
                                            />
                                            <Label htmlFor={amenity.name} className="font-normal">{amenity.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button type="submit">{t('saveChangesButton')}</Button>
                             <Button variant="outline" asChild>
                                <Link href="/dashboard">{t('backToDashboard')}</Link>
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </main>
        </div>
    );
}
