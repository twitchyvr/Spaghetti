
export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-2">Welcome to Enterprise Docs</h3>
          <p className="text-muted-foreground">
            Your AI-powered documentation platform is ready to use.
          </p>
        </div>
      </div>
    </div>
  );
}