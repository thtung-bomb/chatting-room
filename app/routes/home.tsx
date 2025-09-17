import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground font-[Space_Grotesk]">Dudaji Chat</h1>
          <p className="text-muted-foreground">Kết nối và trò chuyện với bạn bè một cách dễ dàng</p>
        </div>

        <div className="space-y-4">
          <Link to="/chat">
            <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              Bắt đầu trò chuyện
            </Button>
          </Link>

          <Link to="/login">
            <Button variant="outline" className="w-full bg-transparent">
              Đăng nhập
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">Được xây dựng với React Router & Supabase</p>
        </div>
      </Card>
    </div>
  )
}
