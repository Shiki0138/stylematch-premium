"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@stylematch/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@stylematch/ui/card"
import { Badge } from "@stylematch/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@stylematch/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@stylematch/ui/tabs"
import { Progress } from "@stylematch/ui/progress"
import { 
  Calendar, Star, MessageCircle, Settings, Sparkles, 
  Clock, MapPin, Video, Camera, Heart, Award, TrendingUp 
} from "lucide-react"
import { api } from "~/trpc/react"
import Link from "next/link"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("overview")

  const { data: consultations } = api.user.getConsultations.useQuery({
    limit: 5,
  })

  const { data: analysisHistory } = api.user.getAnalysisHistory.useQuery({
    limit: 3,
  })

  const { data: favorites } = api.user.getFavoriteStylists.useQuery({
    limit: 4,
  })

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">ログインが必要です</p>
            <Button asChild>
              <Link href="/auth/signin">ログイン</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={session.user?.image || ""} />
              <AvatarFallback className="text-xl">
                {session.user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                おかえりなさい、{session.user?.name}さん
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                あなたの美容ジャーニーを続けましょう
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="consultations">相談履歴</TabsTrigger>
            <TabsTrigger value="analysis">AI診断</TabsTrigger>
            <TabsTrigger value="favorites">お気に入り</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* クイックアクション */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/diagnosis">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h3 className="font-semibold mb-1">AI診断</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      新しい診断を受ける
                    </p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/stylists">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold mb-1">予約する</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      美容師を探して予約
                    </p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/messages">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold mb-1">メッセージ</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      美容師とやりとり
                    </p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/settings">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold mb-1">設定</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      プロフィール設定
                    </p>
                  </CardContent>
                </Link>
              </Card>
            </div>

            {/* 統計情報 */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">相談実績</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                    {consultations?.totalConsultations || 0}回
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    累計相談回数
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">AI診断</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {analysisHistory?.length || 0}回
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    診断履歴
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">お気に入り</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {favorites?.length || 0}人
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    お気に入り美容師
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 最新の診断結果 */}
            {analysisHistory && analysisHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    最新のAI診断結果
                  </CardTitle>
                  <CardDescription>
                    あなたの最新の美容診断結果をチェック
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">顔型</h4>
                      <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-1">
                        {analysisHistory[0].faceShape?.type === "OVAL" && "卵型"}
                        {analysisHistory[0].faceShape?.type === "ROUND" && "丸顔"}
                        {analysisHistory[0].faceShape?.type === "SQUARE" && "ベース型"}
                        {analysisHistory[0].faceShape?.type === "HEART" && "逆三角形"}
                        {analysisHistory[0].faceShape?.type === "OBLONG" && "面長"}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        確信度: {Math.round((analysisHistory[0].faceShape?.confidence || 0) * 100)}%
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">パーソナルカラー</h4>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {analysisHistory[0].personalColor?.type === "SPRING_WARM" && "スプリング"}
                        {analysisHistory[0].personalColor?.type === "SUMMER_COOL" && "サマー"}
                        {analysisHistory[0].personalColor?.type === "AUTUMN_WARM" && "オータム"}
                        {analysisHistory[0].personalColor?.type === "WINTER_COOL" && "ウィンター"}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        確信度: {Math.round((analysisHistory[0].personalColor?.confidence || 0) * 100)}%
                      </p>
                    </div>
                  </div>
                  <Button className="mt-4" asChild>
                    <Link href="/diagnosis/details">
                      詳細を見る
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 次回の予約 */}
            {consultations?.nextConsultation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    次回の予約
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={consultations.nextConsultation.stylist.user.image || ""} />
                      <AvatarFallback>
                        {consultations.nextConsultation.stylist.user.name?.[0] || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {consultations.nextConsultation.stylist.user.name}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(consultations.nextConsultation.scheduledAt), "M月d日(E) HH:mm", { locale: ja })}
                        </div>
                        <div className="flex items-center gap-1">
                          {consultations.nextConsultation.isOnline ? (
                            <><Video className="h-4 w-4" />オンライン</>
                          ) : (
                            <><MapPin className="h-4 w-4" />サロン</>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/consultations/${consultations.nextConsultation.id}`}>
                        詳細
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="consultations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>相談履歴</CardTitle>
                <CardDescription>
                  これまでの美容師との相談履歴
                </CardDescription>
              </CardHeader>
              <CardContent>
                {consultations?.consultations && consultations.consultations.length > 0 ? (
                  <div className="space-y-4">
                    {consultations.consultations.map((consultation) => (
                      <div key={consultation.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Avatar>
                          <AvatarImage src={consultation.stylist.user.image || ""} />
                          <AvatarFallback>
                            {consultation.stylist.user.name?.[0] || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{consultation.stylist.user.name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>
                              {format(new Date(consultation.scheduledAt), "M月d日(E) HH:mm", { locale: ja })}
                            </span>
                            <Badge variant="outline">
                              {consultation.type === "FULL_CONSULTATION" ? "フル相談" : "ミニ相談"}
                            </Badge>
                            <Badge 
                              variant={
                                consultation.status === "COMPLETED" ? "default" :
                                consultation.status === "SCHEDULED" ? "secondary" :
                                "destructive"
                              }
                            >
                              {consultation.status === "COMPLETED" && "完了"}
                              {consultation.status === "SCHEDULED" && "予定"}
                              {consultation.status === "CANCELLED" && "キャンセル"}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/consultations/${consultation.id}`}>
                            詳細
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">相談履歴がありません</p>
                    <Button asChild>
                      <Link href="/stylists">美容師を探す</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI診断履歴</CardTitle>
                <CardDescription>
                  これまでの診断結果を確認
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisHistory && analysisHistory.length > 0 ? (
                  <div className="space-y-4">
                    {analysisHistory.map((analysis, index) => (
                      <div key={analysis.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">
                            診断 #{analysisHistory.length - index}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {format(new Date(analysis.createdAt), "M月d日", { locale: ja })}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">顔型</p>
                            <p className="font-medium">
                              {analysis.faceShape?.type === "OVAL" && "卵型"}
                              {analysis.faceShape?.type === "ROUND" && "丸顔"}
                              {analysis.faceShape?.type === "SQUARE" && "ベース型"}
                              {analysis.faceShape?.type === "HEART" && "逆三角形"}
                              {analysis.faceShape?.type === "OBLONG" && "面長"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">パーソナルカラー</p>
                            <p className="font-medium">
                              {analysis.personalColor?.type === "SPRING_WARM" && "スプリング"}
                              {analysis.personalColor?.type === "SUMMER_COOL" && "サマー"}
                              {analysis.personalColor?.type === "AUTUMN_WARM" && "オータム"}
                              {analysis.personalColor?.type === "WINTER_COOL" && "ウィンター"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">診断履歴がありません</p>
                    <Button asChild>
                      <Link href="/diagnosis">AI診断を受ける</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>お気に入り美容師</CardTitle>
                <CardDescription>
                  お気に入りに登録した美容師
                </CardDescription>
              </CardHeader>
              <CardContent>
                {favorites && favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.map((stylist) => (
                      <div key={stylist.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Avatar>
                          <AvatarImage src={stylist.user.image || ""} />
                          <AvatarFallback>
                            {stylist.user.name?.[0] || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{stylist.user.name}</p>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            {stylist.averageRating?.toFixed(1)} ({stylist.totalReviews}件)
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {stylist.location}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" asChild>
                            <Link href={`/stylists/${stylist.id}`}>
                              詳細
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/booking/${stylist.id}`}>
                              予約
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">お気に入りの美容師がいません</p>
                    <Button asChild>
                      <Link href="/stylists">美容師を探す</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}