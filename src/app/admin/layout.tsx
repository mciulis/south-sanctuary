export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-sm text-gray-800">
      {children}
    </div>
  );
}
