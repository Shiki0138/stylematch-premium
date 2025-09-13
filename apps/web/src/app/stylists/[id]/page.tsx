"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@stylematch/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@stylematch/ui/card"
import { Badge } from "@stylematch/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@stylematch/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@stylematch/ui/tabs"
import { Separator } from "@stylematch/ui/separator"
import { Progress } from "@stylematch/ui/progress"
import { 
  Star, MapPin, Calendar, Video, Award, Clock, 
  Heart, Share2, MessageCircle, Camera, Users 
} from "lucide-react"
import { api } from "~/trpc/react"
import Link from "next/link"

export default function StylistDetailPage() {
  const params = useParams()
  const stylistId = params.id as string
  const [isFavorited, setIsFavorited] = useState(false)

  const { data: stylist, isLoading } = api.stylist.getStylistProfile.useQuery({
    stylistId,
  })

  const { data: portfolio } = api.portfolio.getStylistPortfolio.useQuery({
    stylistId,
  })

  const { data: reviews } = api.review.getStylistReviews.useQuery({
    stylistId,
    limit: 5,
  })

  const { data: reviewSummary } = api.review.getReviewSummary.useQuery({
    stylistId,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!stylist) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">美容師が見つかりませんでした</p>
            <Button asChild>
              <Link href="/stylists">美容師一覧に戻る</Link>
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
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={stylist.user.image || ""} />
                  <AvatarFallback className="text-2xl">
                    {stylist.user.name?.[0] || "S"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">{stylist.user.name}</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {stylist.title}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-medium">
                        {stylist.averageRating?.toFixed(1) || "0.0"}
                      </span>
                      <span className="text-gray-500 ml-1">
                        ({stylist.totalReviews || 0}件)
                      </span>
                    </div>
                    <Badge variant="secondary">
                      <MapPin className="h-3 w-3 mr-1" />
                      {stylist.location}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {stylist.specialties?.slice(0, 5).map((specialty, i) => (
                      <Badge key={i} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                      {stylist.experienceYears}年
                    </div>
                    <div className="text-sm text-gray-500">経験年数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                      {stylist.totalConsultations || 0}
                    </div>
                    <div className="text-sm text-gray-500">相談実績</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                      98%
                    </div>
                    <div className="text-sm text-gray-500">満足度</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                      24h
                    </div>
                    <div className="text-sm text-gray-500">返信時間</div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {stylist.bio}
                </p>

                <div className="flex gap-3">
                  <Button size="lg" asChild>
                    <Link href={`/booking/${stylistId}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      相談を予約する
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    メッセージ
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setIsFavorited(!isFavorited)}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button size="lg" variant="outline">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="portfolio" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="portfolio">ポートフォリオ</TabsTrigger>
                <TabsTrigger value="reviews">レビュー</TabsTrigger>
                <TabsTrigger value="about">詳細情報</TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      作品ギャラリー
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {portfolio?.items?.map((item) => (
                        <div key={item.id} className="space-y-2">
                          <div className="aspect-square relative rounded-lg overflow-hidden">
                            <img
                              src={item.afterImageUrl}
                              alt={item.title}
                              className="object-cover w-full h-full hover:scale-105 transition-transform"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.title}</p>
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {/* レビュー統計 */}
                <Card>
                  <CardHeader>
                    <CardTitle>レビュー統計</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {reviewSummary?.averageRatings?.overall?.toFixed(1) || "0.0"}
                        </div>
                        <div className="text-sm text-gray-500">総合評価</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {reviewSummary?.averageRatings?.communication?.toFixed(1) || "0.0"}
                        </div>
                        <div className="text-sm text-gray-500">コミュニケーション</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {reviewSummary?.averageRatings?.skill?.toFixed(1) || "0.0"}
                        </div>
                        <div className="text-sm text-gray-500">技術力</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {reviewSummary?.averageRatings?.value?.toFixed(1) || "0.0"}
                        </div>
                        <div className="text-sm text-gray-500">コスパ</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {reviewSummary?.ratingDistribution?.reverse().map((dist) => (
                        <div key={dist.rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-sm w-2">{dist.rating}</span>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          </div>
                          <Progress value={dist.percentage} className="flex-1 h-2" />
                          <span className="text-sm text-gray-500 w-12 text-right">
                            {dist.count}件
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* レビュー一覧 */}
                <div className="space-y-4">
                  {reviews?.reviews?.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={review.customer.user.image || ""} />
                            <AvatarFallback>
                              {review.customer.user.name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">
                                {review.customer.user.name}
                              </span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.overallRating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString("ja-JP")}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>プロフィール</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">経歴</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        美容師歴{stylist.experienceYears}年。
                        多数の有名サロンで経験を積み、現在は{stylist.salonName}で活動。
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">資格・認定</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span>美容師免許</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span>カラーリスト検定1級</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">対応可能時間</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>平日</span>
                          <span>10:00 - 20:00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>土日祝</span>
                          <span>9:00 - 18:00</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 料金プラン */}
            <Card>
              <CardHeader>
                <CardTitle>料金プラン</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">ミニ相談</p>
                      <p className="text-sm text-gray-500">30分</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">¥3,000</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">フル相談</p>
                      <p className="text-sm text-gray-500">60分</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">¥5,000</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg" asChild>
                  <Link href={`/booking/${stylistId}`}>
                    今すぐ予約する
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* 空き状況 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  直近の空き状況
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>今日</span>
                    <Badge variant="destructive">満席</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>明日</span>
                    <Badge variant="secondary">◯</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>明後日</span>
                    <Badge variant="secondary">◯</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 関連美容師 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  似た美容師
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={`https://images.unsplash.com/photo-150${i}003211169-0a1dd7228f2d?w=48&h=48&fit=crop`} />
                        <AvatarFallback>S{i}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">山田 美容師</p>
                        <div className="flex items-center text-xs">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1">4.8</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}