"use client"

import { useState } from "react"
import { Button } from "@stylematch/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@stylematch/ui/card"
import { Input } from "@stylematch/ui/input"
import { Badge } from "@stylematch/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@stylematch/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@stylematch/ui/select"
import { Slider } from "@stylematch/ui/slider"
import { Search, MapPin, Star, Calendar, Video, Award, Filter } from "lucide-react"
import { api } from "~/trpc/react"
import Link from "next/link"

const SPECIALTIES = [
  "カット", "カラー", "パーマ", "トリートメント", "ヘアセット",
  "メンズカット", "ブライダル", "着付け", "アップスタイル", "縮毛矯正"
]

const PRICE_RANGES = [
  { label: "〜¥5,000", value: "0-5000" },
  { label: "¥5,001〜¥10,000", value: "5001-10000" },
  { label: "¥10,001〜¥20,000", value: "10001-20000" },
  { label: "¥20,001〜", value: "20001-999999" },
]

export default function StylistsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<string>("")
  const [location, setLocation] = useState("")
  const [rating, setRating] = useState([0])
  const [sortBy, setSortBy] = useState("rating")

  const { data: stylists, isLoading } = api.stylist.searchStylists.useQuery({
    query: searchQuery,
    specialties: selectedSpecialties,
    location,
    minRating: rating[0],
    sortBy,
    limit: 20,
  })

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">美容師を探す</h1>
          <p className="text-gray-600 dark:text-gray-400">
            あなたにピッタリの美容師が見つかります
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* フィルターサイドバー */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  絞り込み
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 検索 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">キーワード検索</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="美容師名、サロン名など"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* 得意分野 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">得意分野</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map(specialty => (
                      <Badge
                        key={specialty}
                        variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleSpecialtyToggle(specialty)}
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 価格帯 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">価格帯</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="価格を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">すべて</SelectItem>
                      {PRICE_RANGES.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* エリア */}
                <div>
                  <label className="text-sm font-medium mb-2 block">エリア</label>
                  <Input
                    placeholder="渋谷、表参道など"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                {/* 評価 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    評価 {rating[0]}つ星以上
                  </label>
                  <Slider
                    value={rating}
                    onValueChange={setRating}
                    min={0}
                    max={5}
                    step={0.5}
                    className="mt-2"
                  />
                </div>

                {/* 並び順 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">並び順</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">評価順</SelectItem>
                      <SelectItem value="price_asc">料金安い順</SelectItem>
                      <SelectItem value="price_desc">料金高い順</SelectItem>
                      <SelectItem value="experience">経験年数順</SelectItem>
                      <SelectItem value="reviews">レビュー数順</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 美容師一覧 */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {stylists?.stylists?.length || 0}件の美容師が見つかりました
              </p>
            </div>

            {isLoading ? (
              <div className="grid gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6">
                {stylists?.stylists?.map((stylist) => (
                  <Card key={stylist.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={stylist.user.image || ""} />
                          <AvatarFallback>
                            {stylist.user.name?.[0] || "S"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">
                                {stylist.user.name}
                              </h3>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="ml-1 text-sm font-medium">
                                    {stylist.averageRating?.toFixed(1) || "0.0"}
                                  </span>
                                  <span className="text-sm text-gray-500 ml-1">
                                    ({stylist.totalReviews || 0}件)
                                  </span>
                                </div>
                                <Badge variant="secondary">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {stylist.location}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                                ¥{stylist.basePrice?.toLocaleString() || "0"}〜
                              </p>
                              <p className="text-sm text-gray-500">相談料金</p>
                            </div>
                          </div>

                          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {stylist.bio}
                          </p>

                          <div className="flex flex-wrap gap-1 mb-4">
                            {stylist.specialties?.slice(0, 6).map((specialty, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Award className="h-4 w-4" />
                                経験{stylist.experienceYears}年
                              </div>
                              <div className="flex items-center gap-1">
                                <Video className="h-4 w-4" />
                                オンライン対応
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" asChild>
                                <Link href={`/stylists/${stylist.id}`}>
                                  詳細を見る
                                </Link>
                              </Button>
                              <Button asChild>
                                <Link href={`/booking/${stylist.id}`}>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  予約する
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {stylists?.stylists?.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-gray-500 mb-4">
                        条件に合う美容師が見つかりませんでした
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("")
                          setSelectedSpecialties([])
                          setPriceRange("")
                          setLocation("")
                          setRating([0])
                        }}
                      >
                        条件をリセット
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}