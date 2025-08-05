
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { allAmenities } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function AddRoomPage() {
    const t = useTranslations('AddRoomPage');
    const router = useRouter();
    const { toast } = useToast();
    
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [imageUrl, setImageUrl] = useState('https://placehold.co/800x600.png');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await fetch('/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, address, imageUrl, amenities: selectedAmenities.map(name => ({ name })) }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add room');
            }
            
            toast({
                title: t('roomAddedTitle'),
                description: t('roomAddedDescription'),
            });
            router.push('/dashboard');

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Failed to add room",
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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-3xl animate-fade-in-up">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{t('addRoomTitle')}</CardTitle>
                            <CardDescription>{t('addRoomDescription')}</CardDescription>
                        </div>
                         <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard"><ArrowLeft/></Link>
                        </Button>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="name">{t('roomNameLabel')}</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
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
                                    <Image src={imageUrl} alt="Room preview" layout="fill" objectFit="cover" data-ai-hint="office interior" />
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
                                        <Input id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" disabled={isLoading} />
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
                        <Button type="submit" size="lg" disabled={isLoading}>{isLoading ? t('addingRoom') : t('addRoomButton')}</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

    