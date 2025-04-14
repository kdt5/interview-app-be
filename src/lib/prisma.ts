import { PrismaClient, Favorite } from "@prisma/client";
import rankingService, { FavoriteTargetType } from "../services/rankingService";

const basePrisma = new PrismaClient();
const prisma = basePrisma.$extends({
  name: "favoriteExtension",
  query: {
    favorite: {
      async create({ args, query }) {
        return basePrisma.$transaction(async (tx) => {
          const result = (await query({ ...args, tx })) as Favorite;
          await rankingService.incrementFavoriteCount(
            result.targetType as FavoriteTargetType,
            Number(result.targetId),
            tx
          );
          return result;
        });
      },
      async delete({ args, query }) {
        return basePrisma.$transaction(async (tx) => {
          const favorite = await tx.favorite.findUnique({
            where: args.where,
          });
          const result = await query({ ...args, tx });
          if (favorite) {
            await rankingService.decrementFavoriteCount(
              favorite.targetType as FavoriteTargetType,
              Number(favorite.targetId),
              tx
            );
          }
          return result;
        });
      },
    },
  },
});

export default prisma;
