"use client"

import { useState } from "react"
import { Button } from "@stylematch/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@stylematch/ui/card"
import { Badge } from "@stylematch/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@stylematch/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@stylematch/ui/tabs"
import { Input } from "@stylematch/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@stylematch/ui/select"
import { Textarea } from "@stylematch/ui/textarea"
import { Separator } from "@stylematch/ui/separator"
import { Progress } from "@stylematch/ui/progress"
import { 
  Users, DollarSign, Calendar, TrendingUp, UserCheck, UserX,
  CheckCircle2, XCircle, AlertCircle, Settings, BarChart3,
  Eye, Edit, Trash2, Download, Upload
} from "lucide-react"
import { api } from "~/trpc/react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  })

  const { data: dashboardStats } = api.admin.getDashboardStats.useQuery()
  
  const { data: pendingStylists } = api.admin.getPendingStylists.useQuery()
  
  const { data: users } = api.admin.getUsers.useQuery({
    limit: 20,
  })

  const reviewStylistMutation = api.admin.reviewStylist.useMutation({
    onSuccess: () => {
      // Refetch data
    },
  })

  const { data: analytics } = api.admin.getAnalytics.useQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
    metric: "revenue",
  })

  const handleStylistReview = async (stylistId: string, action: "approve" | "reject", notes?: string) => {
    try {
      await reviewStylistMutation.mutateAsync({
        stylistId,
        action,
        notes,
      })
    } catch (error) {
      console.error("Review error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">管理画面</h1>
          <p className="text-gray-600 dark:text-gray-400">
            StyleMatch Premiumの管理・分析
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">ダッシュボード</TabsTrigger>
            <TabsTrigger value="users">ユーザー管理</TabsTrigger>
            <TabsTrigger value="stylists">美容師審査</TabsTrigger>
            <TabsTrigger value="analytics">分析</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI カード */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">総ユーザー数</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {dashboardStats?.users?.total?.toLocaleString() || 0}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">総売上</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ¥{dashboardStats?.revenue?.total?.toLocaleString() || 0}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    今月: ¥{dashboardStats?.revenue?.monthlyTotal?.toLocaleString() || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">相談数</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {dashboardStats?.consultations?.total?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    完了: {dashboardStats?.consultations?.byStatus?.COMPLETED || 0}件
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">美容師数</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {dashboardStats?.stylists?.byStatus?.APPROVED || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    審査待ち: {dashboardStats?.stylists?.byStatus?.PENDING_APPROVAL || 0}人
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* チャート・グラフ */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>ユーザー登録推移</CardTitle>
                  <CardDescription>過去30日間の新規登録</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500">チャートエリア（Chart.js等で実装）</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>売上推移</CardTitle>
                  <CardDescription>月別売上</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500">チャートエリア（Chart.js等で実装）</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 最近のアクティビティ */}
            <Card>
              <CardHeader>
                <CardTitle>最近のアクティビティ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm">
                          新しいユーザーが登録しました - 田中太郎
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {i}分前
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>ユーザー管理</CardTitle>
                    <CardDescription>登録ユーザーの管理</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      エクスポート
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input placeholder="ユーザー名、メールで検索" className="max-w-sm" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="customer">顧客</SelectItem>
                      <SelectItem value="stylist">美容師</SelectItem>
                      <SelectItem value="admin">管理者</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {users?.users?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={user.image || ""} />
                          <AvatarFallback>
                            {user.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{user.role}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(user.createdAt), "yyyy/MM/dd", { locale: ja })}登録
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stylists" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>美容師審査</CardTitle>
                <CardDescription>
                  審査待ちの美容師: {pendingStylists?.length || 0}人
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingStylists && pendingStylists.length > 0 ? (
                  <div className="space-y-6">
                    {pendingStylists.map((stylist) => (
                      <div key={stylist.id} className="border rounded-lg p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={stylist.user.image || ""} />
                            <AvatarFallback className="text-lg">
                              {stylist.user.name?.[0] || "S"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold">{stylist.user.name}</h3>
                            <p className="text-muted-foreground">{stylist.title}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">{stylist.location}</Badge>
                              <span className="text-sm text-muted-foreground">
                                経験{stylist.experienceYears}年
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleStylistReview(stylist.id, "approve")}
                              className="bg-green-600 hover:bg-green-700"
                              disabled={reviewStylistMutation.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              承認
                            </Button>
                            <Button
                              onClick={() => handleStylistReview(stylist.id, "reject", "要件を満たしていません")}
                              variant="destructive"
                              disabled={reviewStylistMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              却下
                            </Button>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">プロフィール</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              {stylist.bio}
                            </p>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <strong>サロン:</strong> {stylist.salonName}
                              </p>
                              <p className="text-sm">
                                <strong>得意分野:</strong> {stylist.specialties?.join(", ")}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">ポートフォリオ</h4>
                            <div className="grid grid-cols-3 gap-2">
                              {stylist.portfolioItems?.slice(0, 6).map((item) => (
                                <div key={item.id} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded">
                                  <img
                                    src={item.afterImageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover rounded"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-medium mb-2">審査コメント</h4>
                          <Textarea
                            placeholder="審査コメントを入力..."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">審査待ちの美容師はいません</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">売上分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    ¥{dashboardStats?.revenue?.total?.toLocaleString() || 0}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>今月</span>
                      <span>¥{dashboardStats?.revenue?.monthlyTotal?.toLocaleString() || 0}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      先月比 +15%
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">ユーザー成長</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {dashboardStats?.users?.total || 0}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>顧客</span>
                      <span>{dashboardStats?.users?.byRole?.CUSTOMER || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>美容師</span>
                      <span>{dashboardStats?.users?.byRole?.STYLIST || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">相談統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {dashboardStats?.consultations?.total || 0}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>完了</span>
                      <span>{dashboardStats?.consultations?.byStatus?.COMPLETED || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>予定</span>
                      <span>{dashboardStats?.consultations?.byStatus?.SCHEDULED || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>詳細分析</CardTitle>
                <CardDescription>期間を選択して分析結果を確認</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input type="date" defaultValue={format(dateRange.start, "yyyy-MM-dd")} />
                  <Input type="date" defaultValue={format(dateRange.end, "yyyy-MM-dd")} />
                  <Select defaultValue="revenue">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">売上</SelectItem>
                      <SelectItem value="users">ユーザー</SelectItem>
                      <SelectItem value="consultations">相談</SelectItem>
                      <SelectItem value="stylists">美容師</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    分析実行
                  </Button>
                </div>

                <div className="h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500">分析チャート（Chart.js等で実装）</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>システム設定</CardTitle>
                <CardDescription>プラットフォームの基本設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      プラットフォーム手数料 (%)
                    </label>
                    <Input type="number" defaultValue="20" min="0" max="50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      最低出金額 (円)
                    </label>
                    <Input type="number" defaultValue="1000" min="100" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      キャンセル可能時間 (時間前)
                    </label>
                    <Input type="number" defaultValue="24" min="1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      最大相談時間 (分)
                    </label>
                    <Input type="number" defaultValue="120" min="30" />
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    メンテナンスモード
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="maintenance" />
                    <label htmlFor="maintenance" className="text-sm">
                      メンテナンスモードを有効にする
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    設定を保存
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}