import { model, Schema } from 'mongoose';

export type TaskDocument = {
  text: string;
};

const taskSchema = new Schema<TaskDocument>(
  {
    text: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const TaskModel = model<TaskDocument>('Task', taskSchema);

export default TaskModel;
