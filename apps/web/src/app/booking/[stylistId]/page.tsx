"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@stylematch/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@stylematch/ui/card"
import { Badge } from "@stylematch/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@stylematch/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@stylematch/ui/select"
import { RadioGroup, RadioGroupItem } from "@stylematch/ui/radio-group"
import { Label } from "@stylematch/ui/label"
import { Textarea } from "@stylematch/ui/textarea"
import { Calendar } from "@stylematch/ui/calendar"
import { Separator } from "@stylematch/ui/separator"
import { 
  Calendar as CalendarIcon, Clock, Video, MapPin, 
  CreditCard, CheckCircle2, ArrowRight, ArrowLeft,
  Star, MessageCircle
} from "lucide-react"
import { api } from "~/trpc/react"
import { ConsultationType } from "@prisma/client"
import { format, addDays, isAfter, isBefore, startOfDay } from "date-fns"
import { ja } from "date-fns/locale"

type Step = "date" | "time" | "details" | "payment" | "confirmation"

const CONSULTATION_TYPES = [
  {
    type: "MINI_CONSULTATION" as ConsultationType,
    name: "ミニ相談",
    duration: 30,
    price: 3000,
    description: "簡単なスタイル相談・アドバイス"
  },
  {
    type: "FULL_CONSULTATION" as ConsultationType,
    name: "フル相談",
    duration: 60,
    price: 5000,
    description: "詳細な診断・スタイル提案・アフターフォロー"
  }
]

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const stylistId = params.stylistId as string
  
  const [step, setStep] = useState<Step>("date")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [consultationType, setConsultationType] = useState<ConsultationType>("FULL_CONSULTATION")
  const [isOnline, setIsOnline] = useState(true)
  const [message, setMessage] = useState("")
  const [bookingId, setBookingId] = useState<string>("")

  const { data: stylist } = api.stylist.getStylistProfile.useQuery({
    stylistId,
  })

  const { data: availableSlots } = api.booking.getAvailableSlots.useQuery({
    stylistId,
    date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
    consultationType,
  }, {
    enabled: !!selectedDate,
  })

  const createBookingMutation = api.booking.createBooking.useMutation({
    onSuccess: (data) => {
      setBookingId(data.id)
      setStep("payment")
    },
    onError: (error) => {
      alert(`予約に失敗しました: ${error.message}`)
    },
  })

  const createPaymentIntentMutation = api.payment.createPaymentIntent.useMutation({
    onSuccess: () => {
      setStep("confirmation")
    },
    onError: (error) => {
      alert(`決済の準備に失敗しました: ${error.message}`)
    },
  })

  const selectedPlan = CONSULTATION_TYPES.find(plan => plan.type === consultationType)

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isAfter(date, startOfDay(new Date()))) {
      setSelectedDate(date)
      setSelectedTime("")
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setStep("details")
  }

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedTime) return

    const scheduledAt = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00`)
    
    try {
      await createBookingMutation.mutateAsync({
        stylistId,
        scheduledAt,
        consultationType,
        isOnline,
        message,
      })
    } catch (error) {
      console.error("Booking error:", error)
    }
  }

  const handlePayment = async () => {
    if (!bookingId) return
    
    try {
      await createPaymentIntentMutation.mutateAsync({
        consultationId: bookingId,
      })
    } catch (error) {
      console.error("Payment error:", error)
    }
  }

  const renderDateStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">日程を選択</h2>
        <p className="text-gray-600 dark:text-gray-400">
          相談したい日付を選んでください
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => 
              isBefore(date, startOfDay(new Date())) || 
              isAfter(date, addDays(new Date(), 60))
            }
            locale={ja}
            className="rounded-md border"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">相談プランを選択</h3>
          <RadioGroup
            value={consultationType}
            onValueChange={(value) => setConsultationType(value as ConsultationType)}
          >
            {CONSULTATION_TYPES.map((plan) => (
              <div key={plan.type} className="flex items-center space-x-2">
                <RadioGroupItem value={plan.type} id={plan.type} />
                <Label htmlFor={plan.type} className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-gray-500">{plan.description}</p>
                      <p className="text-sm text-gray-500">{plan.duration}分</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">¥{plan.price.toLocaleString()}</p>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {selectedDate && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">時間を選択</h3>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots?.slots?.map((slot) => {
                  const time = format(new Date(slot), "HH:mm")
                  return (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </Button>
                  )
                })}
              </div>
              {availableSlots?.slots?.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  この日は空きがありません
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">詳細設定</h2>
        <p className="text-gray-600 dark:text-gray-400">
          相談方法とメッセージを設定してください
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">相談方法</h3>
            <RadioGroup
              value={isOnline ? "online" : "offline"}
              onValueChange={(value) => setIsOnline(value === "online")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Video className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">オンライン相談</p>
                      <p className="text-sm text-gray-500">ビデオ通話で相談</p>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="offline" id="offline" />
                <Label htmlFor="offline" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <MapPin className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">サロンで相談</p>
                      <p className="text-sm text-gray-500">
                        {stylist?.salonName} ({stylist?.location})
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">相談内容・要望</h3>
            <Textarea
              placeholder="どのようなスタイルをお考えですか？現在の髪の悩みや理想のイメージがあれば教えてください。"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>予約内容確認</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={stylist?.user.image || ""} />
                  <AvatarFallback>
                    {stylist?.user.name?.[0] || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{stylist?.user.name}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    {stylist?.averageRating?.toFixed(1)} ({stylist?.totalReviews}件)
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>日時</span>
                  <span className="font-medium">
                    {selectedDate && format(selectedDate, "M月d日(E)", { locale: ja })} {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>プラン</span>
                  <span className="font-medium">{selectedPlan?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>時間</span>
                  <span className="font-medium">{selectedPlan?.duration}分</span>
                </div>
                <div className="flex justify-between">
                  <span>方法</span>
                  <span className="font-medium">
                    {isOnline ? "オンライン" : "サロン"}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>合計金額</span>
                <span>¥{selectedPlan?.price.toLocaleString()}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("date")}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  戻る
                </Button>
                <Button
                  onClick={handleBookingSubmit}
                  disabled={createBookingMutation.isPending}
                  className="flex-1"
                >
                  {createBookingMutation.isPending ? "処理中..." : "予約を確定"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">お支払い</h2>
        <p className="text-gray-600 dark:text-gray-400">
          お支払い方法を選択してください
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              お支払い情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">予約内容</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{selectedPlan?.name}</span>
                  <span>¥{selectedPlan?.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>プラットフォーム手数料</span>
                  <span>¥0</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>合計</span>
                  <span>¥{selectedPlan?.price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 実際のプロダクションではStripe Elementsを使用 */}
            <div className="space-y-4">
              <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">決済フォーム（Stripe Elements）</p>
                <p className="text-sm text-gray-400">実装時にはStripe Elementsが表示されます</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("details")}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
              <Button
                onClick={handlePayment}
                disabled={createPaymentIntentMutation.isPending}
                className="flex-1"
              >
                {createPaymentIntentMutation.isPending ? "処理中..." : "支払いを完了"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderConfirmationStep = () => (
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-2">予約が完了しました！</h2>
        <p className="text-gray-600 dark:text-gray-400">
          美容師にメッセージを送信し、当日の詳細についてお知らせします
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>予約詳細</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-left">
          <div className="flex justify-between">
            <span>予約ID</span>
            <span className="font-mono text-sm">{bookingId}</span>
          </div>
          <div className="flex justify-between">
            <span>美容師</span>
            <span className="font-medium">{stylist?.user.name}</span>
          </div>
          <div className="flex justify-between">
            <span>日時</span>
            <span className="font-medium">
              {selectedDate && format(selectedDate, "M月d日(E)", { locale: ja })} {selectedTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span>プラン</span>
            <span className="font-medium">{selectedPlan?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>方法</span>
            <span className="font-medium">
              {isOnline ? "オンライン" : "サロン"}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="flex-1"
        >
          マイページへ
        </Button>
        <Button
          onClick={() => router.push(`/chat/${stylistId}`)}
          className="flex-1"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          美容師にメッセージ
        </Button>
      </div>
    </div>
  )

  if (!stylist) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar>
              <AvatarImage src={stylist.user.image || ""} />
              <AvatarFallback>
                {stylist.user.name?.[0] || "S"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{stylist.user.name} さんの相談予約</h1>
              <p className="text-gray-600 dark:text-gray-400">{stylist.title}</p>
            </div>
          </div>

          {/* ステップインジケーター */}
          <div className="flex items-center gap-2 mb-6">
            {[
              { key: "date", label: "日程選択" },
              { key: "details", label: "詳細設定" },
              { key: "payment", label: "お支払い" },
              { key: "confirmation", label: "完了" },
            ].map((stepItem, index) => (
              <div key={stepItem.key} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepItem.key
                      ? "bg-pink-600 text-white"
                      : index < ["date", "details", "payment", "confirmation"].indexOf(step)
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {index < ["date", "details", "payment", "confirmation"].indexOf(step) ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="ml-2 text-sm hidden sm:inline">{stepItem.label}</span>
                {index < 3 && (
                  <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ステップコンテンツ */}
        {step === "date" && renderDateStep()}
        {step === "details" && renderDetailsStep()}
        {step === "payment" && renderPaymentStep()}
        {step === "confirmation" && renderConfirmationStep()}
      </div>
    </div>
  )
}