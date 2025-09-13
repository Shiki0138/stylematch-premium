import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { ZodError } from "zod"
import { getServerSession } from "@stylematch/auth"
import { prisma } from "@stylematch/database"
import type { User } from "@prisma/client"

export interface CreateContextOptions {
  user?: User & {
    customerProfile?: {
      id: string
    } | null
    stylistProfile?: {
      id: string
    } | null
  } | null
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    user: opts.user,
    prisma,
  }
}

export const createTRPCContext = async () => {
  const session = await getServerSession()
  
  let user = null
  if (session?.user?.id) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        customerProfile: {
          select: { id: true },
        },
        stylistProfile: {
          select: { id: true },
        },
      },
    })
  }

  return createInnerTRPCContext({
    user,
  })
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

const enforceUserIsCustomer = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "CUSTOMER") {
    throw new TRPCError({ code: "FORBIDDEN" })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

const enforceUserIsStylist = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "STYLIST") {
    throw new TRPCError({ code: "FORBIDDEN" })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN" })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
export const customerProcedure = t.procedure.use(enforceUserIsCustomer)
export const stylistProcedure = t.procedure.use(enforceUserIsStylist)
export const adminProcedure = t.procedure.use(enforceUserIsAdmin)