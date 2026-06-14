import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";

export default function AdminPanel() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
        <p className="text-muted-foreground mb-8">System administration features are coming soon.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard" className="text-primary hover:underline font-medium">
            Go to My Learning
          </Link>
          <Link href="/company" className="text-primary hover:underline font-medium">
            Go to Company Dashboard
          </Link>
        </div>
      </div>
    </Layout>
  );
}