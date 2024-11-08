'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();

    return (
        <>
            <div className="animated-gradient" />
            <div className="relative min-h-screen z-10">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">focus</h1>
                    </div>
                    
                    <div 
                        onClick={() => router.push('/tokens')}
                        className="rounded-lg shadow-lg bg-white border border-gray-200 p-6 transition-all hover:shadow-xl hover:scale-105 cursor-pointer"
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-2">View Token List</h2>
                        <p className="text-gray-600">Click to see all filtered tokens and their analytics</p>
                    </div>
                </div>
            </div>
        </>
    );
}