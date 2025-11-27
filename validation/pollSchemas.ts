import { z } from 'zod'

export const pollSchema = z.object({
  title: z
    .string()
    .nonempty('Poll question is required')
    .refine(
      val => val.length <= 90,
      val => ({ message: `${val.length}/90 Max character limit reached` }),
    )
    .refine(
      val => val.length >= 10,
      val => ({ message: 'Must be at least 10 characters' }),
    ),
  description: z
    .string()
    .nonempty('Description is required')
    .refine(
      val => val.length <= 1400,
      val => ({ message: `${val.length}/1400 Max character limit reached` }),
    ),
  tags: z
    .array(
      z
        .string()
        .nonempty('Tag cannot be empty')
        .refine(
          val => val.length <= 20,
          val => ({
            message: `${val.length}/20 Max tag character limit reached`,
          }),
        )
        .refine(
          val => val.length >= 3,
          () => ({ message: 'Must be at least 3 characters' }),
        ),
    )
    .refine(
      val => val.length <= 5,
      val => ({ message: `${val.length}/5 Max tag limit reached` }),
    ),
  options: z
    .array(
      z
        .string()
        .nonempty('Option cannot be empty')
        .refine(
          val => val.length <= 30,
          val => ({ message: `${val.length}/30 Max character limit reached` }),
        ),
    )
    .min(2, 'At least 2 options are required')
    .refine(
      val => val.length <= 20,
      val => ({ message: `${val.length}/20 Max option limit reached` }),
    ),
  startDate: z.string().nonempty('Start date is required'),
  endDate: z.string().nonempty('End date is required'),
  isAnonymous: z.boolean().optional(),
})
