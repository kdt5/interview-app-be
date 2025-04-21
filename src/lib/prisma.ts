import { PrismaClient, Favorite } from "@prisma/client";
import favoriteService from "../services/favoriteService";

const prisma = new PrismaClient().$extends({
  name: "favoriteExtension",
  query: {
    favorite: {
      async create({ args, query }) {
        const result = (await query(args)) as Favorite;
        try {
          await favoriteService.incrementFavoriteCount(
            result.targetType,
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
            await favoriteService.decrementFavoriteCount(
              favorite.targetType,
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
