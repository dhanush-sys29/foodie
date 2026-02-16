
import { LifeBuoy, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SupportPage() {
  return (
    <>
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">
                Support
            </h1>
        </div>
        <Card className="animate-in fade-in duration-500">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <LifeBuoy className="w-10 h-10 text-primary" />
                    <div>
                        <CardTitle>How can we help?</CardTitle>
                        <CardDescription>Get in touch with our support team.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Phone className="w-6 h-6" />
                            <CardTitle className="text-xl">By Phone</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p>Our team is available from 9am to 5pm, Monday to Friday.</p>
                        <p className="text-lg font-semibold text-primary mt-2">1-800-555-FOOD</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Mail className="w-6 h-6" />
                            <CardTitle className="text-xl">By Email</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p>Send us an email and we'll get back to you within 24 hours.</p>
                        <p className="text-lg font-semibold text-primary mt-2">support@foodie.com</p>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    </>
  )
}
