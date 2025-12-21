import { z } from "zod";
import { projectStatus } from "../constants/projectStatus";

/**
 * CREATE PROJECT VALIDATION
 */
export const createProjectSchema = z
  .object({
    name: z
      .string()
      .min(1, "Project name is required")
      .min(3, "Project name must be at least 3 characters long"),

    description: z
      .string()
      .optional(),

    startDate: z
      .string()
      .optional()
      .refine(
        (date) => !date || !isNaN(Date.parse(date)),
        "Start date must be a valid date"
      ),

    endDate: z
      .string()
      .optional()
      .refine(
        (date) => !date || !isNaN(Date.parse(date)),
        "End date must be a valid date"
      ),

    status: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          val === projectStatus.active ||
          val === projectStatus.completed ||
          val === projectStatus.archived,
        "Status must be active, completed, or archived"
      ),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) > new Date(data.startDate);
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

/**
 * UPDATE PROJECT VALIDATION
 * (All fields optional, but rules still apply)
 */
export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .min(3, "Project name must be at least 3 characters long")
      .optional(),

    description: z
      .string()
      .optional(),

    startDate: z
      .string()
      .optional()
      .refine(
        (date) => !date || !isNaN(Date.parse(date)),
        "Start date must be a valid date"
      ),

    endDate: z
      .string()
      .optional()
      .refine(
        (date) => !date || !isNaN(Date.parse(date)),
        "End date must be a valid date"
      ),

    status: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          val === projectStatus.active ||
          val === projectStatus.completed ||
          val === projectStatus.archived,
        "Status must be active, completed, or archived"
      ),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) > new Date(data.startDate);
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );
