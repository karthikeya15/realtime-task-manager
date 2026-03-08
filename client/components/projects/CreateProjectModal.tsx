'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useUIStore } from '../../store/uiStore';
import { useCreateProject } from '../../hooks/useProjects';
import { PROJECT_COLORS, cn } from '../../lib/utils';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  description: z.string().max(1000).default(''),
  color: z.string().default('#6366f1'),
});

type FormData = z.infer<typeof schema>;

export function CreateProjectModal() {
  const { closeModal } = useUIStore();
  const { mutate: createProject, isPending } = useCreateProject();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', color: '#6366f1' },
  });

  const selectedColor = watch('color');

  const onSubmit = (data: FormData) => {
    createProject(data, { onSuccess: closeModal });
  };

  return (
    <Modal open title="New Project" description="Create a workspace for your team" onClose={closeModal}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input label="Project Name" placeholder="e.g. Website Redesign" error={errors.name?.message} {...register('name')} />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Description</label>
          <textarea
            className="w-full bg-ink-muted border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors resize-none h-20"
            placeholder="What's this project about?"
            {...register('description')}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Color</label>
          <div className="flex gap-2 flex-wrap">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={cn('w-7 h-7 rounded-full transition-all', selectedColor === color && 'ring-2 ring-offset-2 ring-offset-ink-soft ring-white scale-110')}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
          <Button type="submit" loading={isPending}>Create Project</Button>
        </div>
      </form>
    </Modal>
  );
}
