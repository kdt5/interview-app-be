import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import prisma from "../lib/prisma.js";

const uploadMiddleware = {
  deleteImageFromS3,
  getUserImageUrl,
};

export default uploadMiddleware;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function deleteImageFromS3(fileUrl: string) {
  const bucket = process.env.AWS_S3_BUCKET_NAME!;
  const key = new URL(fileUrl).pathname.slice(1);

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await s3.send(command);
}

async function getUserImageUrl(userId: number): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profileImageUrl: true },
  });

  if (!user || !user.profileImageUrl) {
    return "";
  } else {
    return user.profileImageUrl;
  }
}
