/*
  Warnings:

  - You are about to drop the `edit_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `slack_link_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "edit_requests" DROP CONSTRAINT "edit_requests_project_id_fkey";

-- DropForeignKey
ALTER TABLE "edit_requests" DROP CONSTRAINT "edit_requests_reviewed_by_fkey";

-- DropForeignKey
ALTER TABLE "edit_requests" DROP CONSTRAINT "edit_requests_user_id_fkey";

-- DropTable
DROP TABLE "edit_requests";

-- DropTable
DROP TABLE "slack_link_tokens";

-- DropEnum
DROP TYPE "EditRequestType";

-- DropEnum
DROP TYPE "RequestStatus";
