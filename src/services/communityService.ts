import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";

const communityService = {
    createPost,
};

export default communityService;

export async function createPost(
    userId: number,
    title: string,
    content: string,
){
    return await prisma.communityPost.create({
        data: {
            userId,
            title,
            content,
            createdAt: dbDayjs(),
            updatedAt: dbDayjs(),
        }
    });
}