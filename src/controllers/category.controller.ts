import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { HTTPSTATUS } from "../config/http.config";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator";
import {
  createCategoryService,
  deleteCategoryService,
  getCategoriesService,
  updateCategoryService,
} from "../services/category.service";

export const getCategoriesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const categories = await getCategoriesService(userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "Categories fetched successfully",
      data: categories,
    });
  }
);

export const createCategoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = createCategorySchema.parse(req.body);
    const category = await createCategoryService(userId, body);
    return res.status(HTTPSTATUS.CREATED).json({
      message: "Category created successfully",
      data: category,
    });
  }
);

export const updateCategoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { id } = req.params;
    const body = updateCategorySchema.parse(req.body);
    const category = await updateCategoryService(userId, id, body);
    return res.status(HTTPSTATUS.OK).json({
      message: "Category updated successfully",
      data: category,
    });
  }
);

export const deleteCategoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { id } = req.params;
    const result = await deleteCategoryService(userId, id);
    return res.status(HTTPSTATUS.OK).json(result);
  }
);
