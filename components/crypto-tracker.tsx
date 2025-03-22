"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, RefreshCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PortfolioTracker from "@/components/portfolio-tracker"

interface Cryptocurrency {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_percentage_24h: number
  price_change_24h: number
}

export default function CryptoTracker() {
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([])
  const [filteredCryptocurrencies, setFilteredCryptocurrencies] = useState<Cryptocurrency[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchCryptocurrencies = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h",
      )

      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }

      const data = await response.json()
      setCryptocurrencies(data)
      setFilteredCryptocurrencies(data)
      setIsLoading(false)
      setIsRefreshing(false)
    } catch (error) {
      console.error("Error fetching cryptocurrency data:", error)
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCryptocurrencies()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCryptocurrencies(cryptocurrencies)
    } else {
      const filtered = cryptocurrencies.filter(
        (crypto) =>
          crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredCryptocurrencies(filtered)
    }
  }, [searchQuery, cryptocurrencies])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchCryptocurrencies()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value)
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`
    } else {
      return formatCurrency(value)
    }
  }

  return (
    <Tabs defaultValue="market">
      <TabsList className="mb-4">
        <TabsTrigger value="market">Market</TabsTrigger>
        <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
      </TabsList>

      <TabsContent value="market">
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-2xl md:text-3xl">Cryptocurrency Tracker</CardTitle>
                <CardDescription>Live prices of the top 50 cryptocurrencies by market cap</CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search cryptocurrency..."
                    className="pl-8 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-10 w-10 shrink-0"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span className="sr-only">Refresh prices</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">24h Change</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Market Cap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-8" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-12" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-4 w-20 ml-auto" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-4 w-16 ml-auto" />
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell">
                          <Skeleton className="h-4 w-24 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredCryptocurrencies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No cryptocurrencies found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCryptocurrencies.map((crypto) => (
                      <TableRow key={crypto.id}>
                        <TableCell className="font-medium">{crypto.market_cap_rank}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={crypto.image || "/placeholder.svg"}
                              alt={crypto.name}
                              className="h-8 w-8 rounded-full"
                            />
                            <div>
                              <div className="font-medium">{crypto.name}</div>
                              <div className="text-xs text-muted-foreground uppercase">{crypto.symbol}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(crypto.current_price)}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            crypto.price_change_percentage_24h > 0
                              ? "text-green-600"
                              : crypto.price_change_percentage_24h < 0
                                ? "text-red-600"
                                : ""
                          }`}
                        >
                          <div className="flex items-center justify-end gap-1">
                            {crypto.price_change_percentage_24h > 0 ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : crypto.price_change_percentage_24h < 0 ? (
                              <ArrowDown className="h-3 w-3" />
                            ) : null}
                            {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                          </div>
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell">
                          {formatMarketCap(crypto.market_cap)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="portfolio">
        <PortfolioTracker cryptocurrencies={cryptocurrencies} />
      </TabsContent>
    </Tabs>
  )
}

