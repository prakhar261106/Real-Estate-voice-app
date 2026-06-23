import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  phone: text('phone'),
  budget: text('budget'),
  city: text('city'),
  propertyType: text('property_type'),
  status: text('status').default('new'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  price: text('price'),
  location: text('location'),
  type: text('type'), // Residential, Commercial, Luxury, Rental, Investment
  amenities: jsonb('amenities'),
  images: jsonb('images'),
  status: text('status').default('available'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  leadId: integer('lead_id').references(() => leads.id),
  propertyId: integer('property_id').references(() => properties.id),
  date: timestamp('date').notNull(),
  status: text('status').default('scheduled'), // scheduled, rescheduled, cancelled
  createdAt: timestamp('created_at').defaultNow(),
});

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  leadId: integer('lead_id').references(() => leads.id),
  summary: text('summary'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const voiceSessions = pgTable('voice_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  durationSeconds: integer('duration_seconds'),
  transcript: jsonb('transcript'),
  callQuality: text('call_quality'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const analytics = pgTable('analytics', {
  id: serial('id').primaryKey(),
  metricName: text('metric_name').notNull(),
  metricValue: integer('metric_value').notNull(),
  date: timestamp('date').defaultNow(),
});
