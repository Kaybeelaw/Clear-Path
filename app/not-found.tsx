import Link from "next/link";

export default function NotFound() {
     return (
        <div className="h-screen flex flex-col gap-4 flex-center items-center justify-center">

            <h1 className="text-7xl font-bold">404</h1>
            <p>We couldn't find the page you're looking for</p>

            <Link href="/" className="hover:underline">Go Home</Link>

           
        
        </div>
    )
}