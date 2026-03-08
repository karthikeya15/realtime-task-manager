'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useUIStore } from '../../store/uiStore';
import { useCreateTask } from '../../hooks/useTasks';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).default(''),
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof schema>;

export function CreateTaskModal() {
  const { closeModal, modalData } = useUIStore();
  const projectId = modalData.projectId as string;
  const { mutate: createTask, isPending } = useCreateTask(projectId);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      status: (modalData.status as any) || 'todo',
      priority: 'medium',
    },
  });

  const onSubmit = (data: FormData) => {
    createTask(data, { onSuccess: closeModal });
  };

  return (
    <Modal open title="New Task" description="Add a task to this project" onClose={closeModal} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Title" placeholder="What needs to be done?" error={errors.title?.message} {...register('title')} />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Description</label>
          <textarea
            className="w-full bg-ink-muted border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors resize-none h-24"
            placeholder="Add more context…"
            {...register('description')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            options={[
              { value: 'backlog', label: 'Backlog' },
              { value: 'todo', label: 'To Do' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'in_review', label: 'In Review' },
              { value: 'done', label: 'Done' },
            ]}
            {...register('status')}
          />
          <Select
            label="Priority"
            options={[
              { value: 'low', label: '↓ Low' },
              { value: 'medium', label: '→ Medium' },
              { value: 'high', label: '↑ High' },
              { value: 'urgent', label: '⚡ Urgent' },
            ]}
            {...register('priority')}
          />
        </div>
        <Input label="Due Date" type="date" {...register('dueDate')} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
          <Button type="submit" loading={isPending}>Create Task</Button>
        </div>
      </form>
    </Modal>
  );
}
