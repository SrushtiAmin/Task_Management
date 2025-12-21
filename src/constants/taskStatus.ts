export const taskStatus = {
  todo: 'todo',
  inProgress: 'in_progress',
  inReview: 'in_review',
  done: 'done',
} as const;

export const taskStatusFlow = [
  taskStatus.todo,
  taskStatus.inProgress,
  taskStatus.inReview,
  taskStatus.done,
];
