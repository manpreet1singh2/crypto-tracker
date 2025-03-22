"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

interface Cryptocurrency {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
}

interface Transaction {
  id: string
  cryptoId: string
  cryptoName: string
  cryptoSymbol: string
  cryptoImage: string
  quantity: number
  purchasePrice: number
  purchaseDate: string
  currentPrice: number
}

export default function PortfolioTracker({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedCrypto, setSelectedCrypto] = useState<string>("")
  const [quantity, setQuantity] = useState<string>("")
  const [purchasePrice, setPurchasePrice] = useState<string>("")
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem("cryptoTransactions")
    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions)
        // Update current prices
        const updatedTransactions = parsedTransactions.map((transaction: Transaction) => {
          const crypto = cryptocurrencies.find((c) => c.id === transaction.cryptoId)
          return {
            ...transaction,
            currentPrice: crypto?.current_price || transaction.currentPrice,
          }
        })
        setTransactions(updatedTransactions)
      } catch (error) {
        console.error("Error parsing saved transactions:", error)
      }
    }
  }, [cryptocurrencies])

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("cryptoTransactions", JSON.stringify(transactions))
  }, [transactions])

  const handleAddTransaction = () => {
    if (!selectedCrypto || !quantity || !purchasePrice || !purchaseDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const selectedCryptocurrency = cryptocurrencies.find((crypto) => crypto.id === selectedCrypto)
    if (!selectedCryptocurrency) {
      toast({
        title: "Invalid cryptocurrency",
        description: "Please select a valid cryptocurrency",
        variant: "destructive",
      })
      return
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      cryptoId: selectedCryptocurrency.id,
      cryptoName: selectedCryptocurrency.name,
      cryptoSymbol: selectedCryptocurrency.symbol,
      cryptoImage: selectedCryptocurrency.image,
      quantity: Number.parseFloat(quantity),
      purchasePrice: Number.parseFloat(purchasePrice),
      purchaseDate: purchaseDate,
      currentPrice: selectedCryptocurrency.current_price,
    }

    setTransactions([...transactions, newTransaction])
    setIsDialogOpen(false)
    resetForm()

    toast({
      title: "Transaction added",
      description: `Added ${quantity} ${selectedCryptocurrency.symbol.toUpperCase()} to your portfolio`,
    })
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== id))
    toast({
      title: "Transaction removed",
      description: "Transaction has been removed from your portfolio",
    })
  }

  const resetForm = () => {
    setSelectedCrypto("")
    setQuantity("")
    setPurchasePrice("")
    setPurchaseDate(new Date().toISOString().split("T")[0])
  }

  const calculatePortfolioStats = () => {
    let totalInvestment = 0
    let totalCurrentValue = 0

    transactions.forEach((transaction) => {
      totalInvestment += transaction.purchasePrice * transaction.quantity
      totalCurrentValue += transaction.currentPrice * transaction.quantity
    })

    const totalProfit = totalCurrentValue - totalInvestment
    const profitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0

    return {
      totalInvestment,
      totalCurrentValue,
      totalProfit,
      profitPercentage,
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value)
  }

  const stats = calculatePortfolioStats()

  // Group transactions by cryptocurrency for the Holdings view
  const holdings = transactions.reduce((acc, transaction) => {
    const existingHolding = acc.find((h) => h.cryptoId === transaction.cryptoId)

    if (existingHolding) {
      existingHolding.totalQuantity += transaction.quantity
      existingHolding.totalInvestment += transaction.purchasePrice * transaction.quantity
      existingHolding.transactions.push(transaction)
    } else {
      acc.push({
        cryptoId: transaction.cryptoId,
        cryptoName: transaction.cryptoName,
        cryptoSymbol: transaction.cryptoSymbol,
        cryptoImage: transaction.cryptoImage,
        currentPrice: transaction.currentPrice,
        totalQuantity: transaction.quantity,
        totalInvestment: transaction.purchasePrice * transaction.quantity,
        transactions: [transaction],
      })
    }

    return acc
  }, [] as any[])

  // Calculate average purchase price and profit/loss for each holding
  holdings.forEach((holding) => {
    holding.avgPurchasePrice = holding.totalInvestment / holding.totalQuantity
    holding.currentValue = holding.currentPrice * holding.totalQuantity
    holding.profit = holding.currentValue - holding.totalInvestment
    holding.profitPercentage = (holding.profit / holding.totalInvestment) * 100
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Portfolio Tracker</CardTitle>
        <CardDescription>Track your cryptocurrency investments and profits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="py-4">
              <CardDescription>Total Investment</CardDescription>
              <CardTitle>{formatCurrency(stats.totalInvestment)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardDescription>Current Value</CardDescription>
              <CardTitle>{formatCurrency(stats.totalCurrentValue)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardDescription>Total Profit/Loss</CardDescription>
              <CardTitle className={stats.totalProfit >= 0 ? "text-green-600" : "text-red-600"}>
                {formatCurrency(stats.totalProfit)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardDescription>Profit/Loss %</CardDescription>
              <CardTitle className={stats.profitPercentage >= 0 ? "text-green-600" : "text-red-600"}>
                {stats.profitPercentage.toFixed(2)}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="holdings">
          <TabsList className="mb-4">
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Avg. Purchase Price</TableHead>
                    <TableHead className="text-right">Current Price</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead className="text-right">Profit/Loss</TableHead>
                    <TableHead className="text-right">Profit/Loss %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No holdings yet. Add a transaction to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    holdings.map((holding) => (
                      <TableRow key={holding.cryptoId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={holding.cryptoImage || "/placeholder.svg"}
                              alt={holding.cryptoName}
                              className="h-8 w-8 rounded-full"
                            />
                            <div>
                              <div className="font-medium">{holding.cryptoName}</div>
                              <div className="text-xs text-muted-foreground uppercase">{holding.cryptoSymbol}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{holding.totalQuantity.toFixed(6)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(holding.avgPurchasePrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(holding.currentPrice)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(holding.currentValue)}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            holding.profit >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(holding.profit)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            holding.profitPercentage >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {holding.profitPercentage.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Purchase Price</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                    <TableHead className="text-right">Purchase Date</TableHead>
                    <TableHead className="text-right">Current Value</TableHead>
                    <TableHead className="text-right">Profit/Loss</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No transactions yet. Add a transaction to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => {
                      const totalCost = transaction.purchasePrice * transaction.quantity
                      const currentValue = transaction.currentPrice * transaction.quantity
                      const profit = currentValue - totalCost
                      const profitPercentage = (profit / totalCost) * 100

                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={transaction.cryptoImage || "/placeholder.svg"}
                                alt={transaction.cryptoName}
                                className="h-8 w-8 rounded-full"
                              />
                              <div>
                                <div className="font-medium">{transaction.cryptoName}</div>
                                <div className="text-xs text-muted-foreground uppercase">
                                  {transaction.cryptoSymbol}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{transaction.quantity.toFixed(6)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(transaction.purchasePrice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(totalCost)}</TableCell>
                          <TableCell className="text-right">
                            {new Date(transaction.purchaseDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(currentValue)}</TableCell>
                          <TableCell
                            className={`text-right font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(profit)} ({profitPercentage.toFixed(2)}%)
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(transaction.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete transaction</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
              <DialogDescription>Add a new cryptocurrency purchase to your portfolio.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="crypto">Cryptocurrency</Label>
                <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                  <SelectTrigger id="crypto">
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptocurrencies.map((crypto) => (
                      <SelectItem key={crypto.id} value={crypto.id}>
                        <div className="flex items-center gap-2">
                          <img
                            src={crypto.image || "/placeholder.svg"}
                            alt={crypto.name}
                            className="h-5 w-5 rounded-full"
                          />
                          {crypto.name} ({crypto.symbol.toUpperCase()})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Purchase Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="any"
                  min="0"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Purchase Date</Label>
                <Input id="date" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTransaction}>Add Transaction</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}

