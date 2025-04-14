import { PrismaClient, Favorite } from "@prisma/client";
import rankingService, { FavoriteTargetType } from "../services/rankingService";

const prisma = new PrismaClient().$extends({
  name: "favoriteExtension",
  query: {
    favorite: {
      async create({ args, query }) {
        const result = (await query(args)) as Favorite;
        try {
          await rankingService.incrementFavoriteCount(
            result.targetType as FavoriteTargetType,
            Number(result.targetId)
          );
        } catch (error) {
          console.error("incrementFavoriteCount failed:", error);
        }
        return result;
      },
      async delete({ args, query }) {
        const favorite = await prisma.favorite.findUnique({
          where: args.where,
        });

        const result = await query(args);

        if (favorite) {
          try {
            await rankingService.decrementFavoriteCount(
              favorite.targetType as FavoriteTargetType,
              Number(favorite.targetId)
            );
          } catch (error) {
            console.error("decrementFavoriteCount failed:", error);
          }
        }
        return result;
      },
    },
  },
});

export default prisma;
