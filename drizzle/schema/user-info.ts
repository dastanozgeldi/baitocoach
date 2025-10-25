import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { user } from './better-auth';

export const userInfo = pgTable('user_info', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .unique()
    .references(() => user.id),
  
  // Personal Information
  nameRomaji: text('nameRomaji').notNull(),
  nationality: text('nationality').notNull(),
  studentStatus: text('studentStatus').notNull(), // university/language school/etc.
  
  // Job Preferences
  jobTypeInterested: text('jobTypeInterested').notNull(), // Konbini, Restaurant, Warehouse, Delivery, Cleaning, Other
  
  // Availability
  daysAvailable: text('daysAvailable').notNull(), // JSON array of days: ["Mon", "Tue", etc.]
  hoursPerWeek: integer('hoursPerWeek').notNull(),
  timePreference: text('timePreference').notNull(), // morning/afternoon/evening/late night (can be multiple, JSON array)
  
  // Experience
  hasExperience: boolean('hasExperience').notNull(),
  experienceDescription: text('experienceDescription'),
  
  // Language
  japaneseLevel: text('japaneseLevel').notNull(), // Beginner/N5/N4/N3
  
  // Additional Information
  dietaryRestrictions: text('dietaryRestrictions'),
  
  // Contact
  preferredContactMethod: text('preferredContactMethod').notNull(), // phone/email
  contactDetails: text('contactDetails').notNull(),
  
  // Timestamps
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

