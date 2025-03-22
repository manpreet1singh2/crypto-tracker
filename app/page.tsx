import CryptoTracker from "@/components/crypto-tracker"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <CryptoTracker />
      </div>
    </main>
  )
}

