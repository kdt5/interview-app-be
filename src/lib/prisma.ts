import { PrismaClient } from "@prisma/client";
import rankingService, { FavoriteTargetType } from "../services/rankingService";

const prisma = new PrismaClient().$extends({
  name: "favoriteExtension",
  query: {
    favorite: {
      async create({ args, query }) {
        const result = await query(args);
        await rankingService.incrementFavoriteCount(
          result.targetType as FavoriteTargetType,
          result.targetId as number
        );
        return result;
      },
      async delete({ args, query }) {
        const favorite = await prisma.favorite.findUnique({
          where: args.where,
        });

        const result = await query(args);

        if (favorite) {
          await rankingService.decrementFavoriteCount(
            favorite.targetType as FavoriteTargetType,
            favorite.targetId as number
          );
        }
        return result;
      },
    },
  },
});

export default prisma;
