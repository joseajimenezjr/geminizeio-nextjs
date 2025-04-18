import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, AlertCircle, ImageIcon, Clock } from "lucide-react"
import { getShopProducts } from "@/app/actions/shop"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

// Function to generate a placeholder color based on product name
function generatePlaceholderColor(name: string) {
  // Simple hash function to generate a consistent color for the same name
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Generate HSL color with fixed saturation and lightness for consistency
  const h = Math.abs(hash % 360)
  return `hsl(${h}, 70%, 60%)`
}

export default async function ShopPage() {
  const { data: products, error } = (await getShopProducts()) || { data: [], error: null }

  return (
    <div className="flex min-h-screen flex-col pb-16">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold">Shop</h1>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">View cart</span>
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                0
              </span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Error loading products: {error}</AlertDescription>
          </Alert>
        )}

        {products && products.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const placeholderColor = generatePlaceholderColor(product.accessoryName)
              const isComingSoon = product.status === "coming-soon"

              return (
                <Card key={product.id} className={`overflow-hidden ${isComingSoon ? "border-dashed" : ""}`}>
                  <CardHeader className="p-0 relative">
                    {product.accessoryIcon ? (
                      <img
                        src={product.accessoryIcon || "/placeholder.svg"}
                        alt={product.accessoryName}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-40 flex items-center justify-center"
                        style={{ backgroundColor: placeholderColor }}
                      >
                        <div className="text-center text-white">
                          <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-70" />
                          <span className="text-sm font-medium">{product.accessoryType || "Accessory"}</span>
                        </div>
                      </div>
                    )}

                    {isComingSoon && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="bg-background px-4 py-2 rounded-md flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-primary">Coming Soon</span>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-base">{product.accessoryName}</CardTitle>
                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                    <div className="mt-2 flex justify-between items-center">
                      <p className="font-bold text-primary">{product.price}</p>
                      {!isComingSoon && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${product.availabilityStatus ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"}`}
                        >
                          {product.availabilityStatus ? "In Stock" : "Out of Stock"}
                        </span>
                      )}
                      {isComingSoon && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                          Notify Me
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    {isComingSoon ? (
                      <Button className="w-full" variant="outline" size="sm">
                        <Clock className="mr-2 h-4 w-4" />
                        Notify When Available
                      </Button>
                    ) : (
                      <Button className="w-full" disabled={!product.availabilityStatus} size="sm">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-0">
                  <Skeleton className="h-40 w-full" />
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="mt-2 flex justify-between items-center">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
