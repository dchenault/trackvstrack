import { EventEmitter } from '@/lib/events';
import { FirestorePermissionError } from './errors';

type ErrorEvents = {
  'permission-error': FirestorePermissionError;
};

export const errorEmitter = new EventEmitter<ErrorEvents>();
