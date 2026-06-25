import { Router } from "express";
import {
  createCategoryController,
  deleteCategoryController,
  getCategoriesController,
  updateCategoryController,
} from "../controllers/category.controller";

const categoryRoutes = Router();

categoryRoutes.get("/", getCategoriesController);
categoryRoutes.post("/", createCategoryController);
categoryRoutes.put("/:id", updateCategoryController);
categoryRoutes.delete("/:id", deleteCategoryController);

export default categoryRoutes;
