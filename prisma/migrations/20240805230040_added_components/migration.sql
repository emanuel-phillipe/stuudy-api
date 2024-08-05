-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "components" TEXT[] DEFAULT ARRAY['']::TEXT[];
