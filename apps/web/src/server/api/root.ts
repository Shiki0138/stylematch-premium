import { createTRPCRouter } from "./trpc"
import { authRouter } from "./routers/auth"
import { userRouter } from "./routers/user"
import { stylistRouter } from "./routers/stylist"
import { consultationRouter } from "./routers/consultation"
import { analysisRouter } from "./routers/analysis"
import { bookingRouter } from "./routers/booking"
import { reviewRouter } from "./routers/review"
import { portfolioRouter } from "./routers/portfolio"
import { paymentRouter } from "./routers/payment"
import { adminRouter } from "./routers/admin"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  stylist: stylistRouter,
  consultation: consultationRouter,
  analysis: analysisRouter,
  booking: bookingRouter,
  review: reviewRouter,
  portfolio: portfolioRouter,
  payment: paymentRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter