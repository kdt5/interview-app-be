/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import express from "express";
import multer from "multer";
import multerS3, { AUTO_CONTENT_TYPE } from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";
import authMiddleware from "../middlewares/authMiddleware";
import { uploadProfile } from "../controllers/uploadController";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME!,
    contentType: AUTO_CONTENT_TYPE,
    key: function (req, file: Express.Multer.File, cb) {
      const baseName = path
        .basename(file.originalname, path.extname(file.originalname))
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "-");
      const filename = `${Date.now()}-${baseName}-${uuidv4()}${path.extname(
        file.originalname
      )}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      return cb(new Error(".jpg, .jpeg, .png 파일만 업로드 가능합니다."));
    }
    cb(null, true);
  },
});

router.post(
  "/profile",
  authMiddleware.authenticate,
  upload.single("profile"),
  uploadProfile
);

export default router;
