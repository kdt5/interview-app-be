import prisma from "../lib/prisma.js";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";

const uploadService = {
  uploadImage,
};

export default uploadService;

async function uploadImage(userId: number, imageUrl: string) {
  const existingImageUrl = await uploadMiddleware.getUserImageUrl(userId);

  if (existingImageUrl !== "") {
    await uploadMiddleware.deleteImageFromS3(existingImageUrl);
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { profileImageUrl: imageUrl },
    select: { profileImageUrl: true },
  });
}
