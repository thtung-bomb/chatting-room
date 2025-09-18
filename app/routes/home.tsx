import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground font-[Space_Grotesk]">Dudaji Chat</h1>
          <p className="text-muted-foreground">Chat app connect you with your friends</p>
        </div>

        <div className="space-y-4">
          <Link to="/login">
            <Button variant="outline" className="w-full bg-transparent cursor-pointer hover:bg-secondary/30">
              Login in here
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
