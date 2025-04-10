/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { FavoriteTargetType } from "@prisma/client";
import { param } from "express-validator";

export const validateTargetType = [
  param("targetType")
    .notEmpty()
    .withMessage("즐겨찾기 대상이 비어있습니다.")
    .custom((value: string) => {
      const upperCased = value.toUpperCase();
      return Object.values(FavoriteTargetType).includes(
        upperCased as FavoriteTargetType
      );
    })
    .withMessage("즐겨찾기 대상이 아닙니다."),
];

export const validateTargetId = [
  param("targetId")
    .exists()
    .withMessage("게시물 아이디는 필수입니다.")
    .isInt({ min: 1 })
    .withMessage("게시물 아이디는 1 이상의 정수만 가능합니다."),
];
