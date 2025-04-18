import prisma from "../lib/prisma.js";

const uploadService = {
    uploadImage,
}

export default uploadService;

async function uploadImage(userId: number, imageUrl: string) {
    return await prisma.user.update({
        where: { id: userId },
        data: { profileImageUrl: imageUrl },
        select: { profileImageUrl: true }
    })
}

